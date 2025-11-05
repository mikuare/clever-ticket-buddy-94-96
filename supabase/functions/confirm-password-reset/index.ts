
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      console.error('No token provided');
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log('Processing password reset confirmation with token:', token);

    // Get the password reset request
    const { data: resetRequest, error: fetchError } = await supabase
      .from("password_reset_requests")
      .select("*")
      .eq("token", token)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (fetchError || !resetRequest) {
      console.error('Invalid or expired token:', fetchError);
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log('Valid reset request found for email:', resetRequest.email);

    // Get user ID from profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", resetRequest.email)
      .single();
    
    if (profileError || !profile) {
      console.error('User not found in profiles:', profileError);
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log('User found, updating password for user ID:', profile.id);

    // Decrypt the password
    const newPassword = atob(resetRequest.encrypted_password);

    // Update the user's password using the correct admin method
    const { error: updateError } = await supabase.auth.admin.updateUserById(profile.id, {
      password: newPassword
    });

    if (updateError) {
      console.error("Error updating password:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update password" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log('Password updated successfully');

    // Mark the reset request as used
    const { error: markUsedError } = await supabase
      .from("password_reset_requests")
      .update({ used: true })
      .eq("id", resetRequest.id);

    if (markUsedError) {
      console.error("Error marking reset request as used:", markUsedError);
    }

    // Redirect to success page
    const redirectUrl = `${req.headers.get("origin")}/?reset=success`;
    console.log('Redirecting to:', redirectUrl);
    
    return new Response(null, {
      status: 302,
      headers: {
        "Location": redirectUrl,
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error("Error in confirm-password-reset function:", error);
    const redirectUrl = `${req.headers.get("origin")}/?reset=error`;
    return new Response(null, {
      status: 302,
      headers: {
        "Location": redirectUrl,
        ...corsHeaders
      }
    });
  }
};

serve(handler);
