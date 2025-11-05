
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resendApiKey = Deno.env.get("RESEND_API_KEY");

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  newPassword: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, newPassword }: PasswordResetRequest = await req.json();
    
    console.log('Processing password reset request for email:', email);

    // Check if user exists in profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("email", email)
      .single();

    if (profileError || !profile) {
      console.error('User not found in profiles:', profileError);
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log('User found in profiles:', profile.id);

    // Hash the password (simple base64 encoding for demo - in production use proper encryption)
    const encryptedPassword = btoa(newPassword);

    // Store the password reset request
    const { data: resetRequest, error: insertError } = await supabase
      .from("password_reset_requests")
      .insert({
        email,
        encrypted_password: encryptedPassword,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error storing reset request:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to process reset request" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log('Password reset request stored with token:', resetRequest.token);

    // Send confirmation email if Resend API key is available
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        const confirmationUrl = `${req.headers.get("origin")}/confirm-password-reset?token=${resetRequest.token}`;

        await resend.emails.send({
          from: "QMAZ Help Desk <noreply@resend.dev>",
          to: [email],
          subject: "Confirm Your Password Reset",
          html: `
            <h1>Password Reset Confirmation</h1>
            <p>You requested to reset your password. Click the link below to confirm and update your password:</p>
            <a href="${confirmationUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Confirm Password Reset</a>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this reset, please ignore this email.</p>
          `,
        });
        
        console.log('Confirmation email sent successfully');
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // Don't fail the request if email sending fails
      }
    } else {
      console.log('No Resend API key configured, skipping email');
    }

    return new Response(
      JSON.stringify({ message: "Password reset confirmation sent to your email" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error) {
    console.error("Error in custom-password-reset function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
