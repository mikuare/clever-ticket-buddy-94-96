
-- Update the log_ticket_activity function to properly handle department information
CREATE OR REPLACE FUNCTION public.log_ticket_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_profile RECORD;
  activity_desc TEXT;
  activity_user_id UUID;
BEGIN
  -- Handle INSERT (new ticket creation)
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.ticket_activities (
      ticket_id, 
      user_id, 
      activity_type, 
      description,
      department_code
    ) VALUES (
      NEW.id,
      NEW.user_id,
      'created',
      'Ticket created with priority: ' || NEW.priority,
      NEW.department_code
    );
    RETURN NEW;
  END IF;

  -- Handle UPDATE (status changes, assignments, etc.)
  IF TG_OP = 'UPDATE' THEN
    -- Status change
    IF OLD.status != NEW.status THEN
      -- Determine the user who performed the action and get their details
      IF NEW.assigned_admin_id IS NOT NULL THEN
        activity_user_id := NEW.assigned_admin_id;
        SELECT full_name, department_code INTO admin_profile
        FROM public.profiles 
        WHERE id = NEW.assigned_admin_id;
      ELSE
        activity_user_id := NEW.user_id;
        SELECT full_name, department_code INTO admin_profile
        FROM public.profiles 
        WHERE id = NEW.user_id;
      END IF;

      -- Determine activity description based on status change
      CASE NEW.status
        WHEN 'In Progress' THEN
          activity_desc := 'Ticket assigned to ' || COALESCE(NEW.assigned_admin_name, admin_profile.full_name, 'admin');
        WHEN 'Resolved' THEN
          activity_desc := 'Ticket marked as resolved by ' || COALESCE(NEW.assigned_admin_name, admin_profile.full_name, 'admin');
        WHEN 'Closed' THEN
          IF NEW.user_closed_at IS NOT NULL THEN
            activity_desc := 'Ticket closed by user';
            -- For user-closed tickets, use the original ticket creator's info
            SELECT full_name, department_code INTO admin_profile
            FROM public.profiles 
            WHERE id = NEW.user_id;
            activity_user_id := NEW.user_id;
          ELSE
            activity_desc := 'Ticket automatically closed after time limit';
          END IF;
        ELSE
          activity_desc := 'Status changed to ' || NEW.status;
      END CASE;

      INSERT INTO public.ticket_activities (
        ticket_id,
        user_id,
        activity_type,
        description,
        admin_name,
        department_code
      ) VALUES (
        NEW.id,
        activity_user_id,
        'status_changed',
        activity_desc,
        admin_profile.full_name,
        admin_profile.department_code
      );
    END IF;

    -- Assignment change
    IF OLD.assigned_admin_id IS DISTINCT FROM NEW.assigned_admin_id AND NEW.assigned_admin_id IS NOT NULL THEN
      SELECT full_name, department_code INTO admin_profile
      FROM public.profiles 
      WHERE id = NEW.assigned_admin_id;

      INSERT INTO public.ticket_activities (
        ticket_id,
        user_id,
        activity_type,
        description,
        admin_name,
        department_code
      ) VALUES (
        NEW.id,
        NEW.assigned_admin_id,
        'assigned',
        'Ticket assigned to ' || COALESCE(NEW.assigned_admin_name, admin_profile.full_name, 'admin'),
        admin_profile.full_name,
        admin_profile.department_code
      );
    END IF;

    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$;

-- Also update the referral activity logging function to ensure proper department tracking
CREATE OR REPLACE FUNCTION public.log_referral_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  referring_admin RECORD;
  referred_admin RECORD;
  ticket_info RECORD;
BEGIN
  -- Get admin details with better error handling
  SELECT full_name, department_code INTO referring_admin
  FROM public.profiles WHERE id = NEW.referring_admin_id;
  
  SELECT full_name, department_code INTO referred_admin
  FROM public.profiles WHERE id = NEW.referred_admin_id;
  
  SELECT ticket_number INTO ticket_info
  FROM public.tickets WHERE id = NEW.ticket_id;

  IF TG_OP = 'INSERT' THEN
    -- Log referral creation
    INSERT INTO public.ticket_activities (
      ticket_id,
      user_id,
      activity_type,
      description,
      admin_name,
      department_code
    ) VALUES (
      NEW.ticket_id,
      NEW.referring_admin_id,
      'referred',
      'Ticket referred to ' || COALESCE(referred_admin.full_name, 'admin') || ' (' || COALESCE(referred_admin.department_code, 'Unknown') || ')',
      COALESCE(referring_admin.full_name, 'Unknown Admin'),
      COALESCE(referring_admin.department_code, 'Unknown')
    );
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    -- Log referral status changes
    CASE NEW.status
      WHEN 'accepted' THEN
        INSERT INTO public.ticket_activities (
          ticket_id,
          user_id,
          activity_type,
          description,
          admin_name,
          department_code
        ) VALUES (
          NEW.ticket_id,
          NEW.referred_admin_id,
          'referral_accepted',
          'Referral accepted by ' || COALESCE(referred_admin.full_name, 'admin'),
          COALESCE(referred_admin.full_name, 'Unknown Admin'),
          COALESCE(referred_admin.department_code, 'Unknown')
        );
      WHEN 'declined' THEN
        INSERT INTO public.ticket_activities (
          ticket_id,
          user_id,
          activity_type,
          description,
          admin_name,
          department_code
        ) VALUES (
          NEW.ticket_id,
          NEW.referred_admin_id,
          'referral_declined',
          'Referral declined by ' || COALESCE(referred_admin.full_name, 'admin'),
          COALESCE(referred_admin.full_name, 'Unknown Admin'),
          COALESCE(referred_admin.department_code, 'Unknown')
        );
    END CASE;
  END IF;

  RETURN NEW;
END;
$$;
