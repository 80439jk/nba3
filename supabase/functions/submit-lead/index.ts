import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface LeadPayload {
  transaction_id: string;
  state: string;
  dob: string;
  citizenship: string;
  street_address: string;
  city: string;
  zip: string;
  annual_income: string;
  employment_status: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  tcpa_consent: boolean;
  jornaya_leadid: string;
  click_id?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const payload: LeadPayload = await req.json();

    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";

    const { data: leadData, error: insertError } = await supabase
      .from("leads")
      .insert({
        transaction_id: payload.transaction_id,
        state: payload.state,
        dob: payload.dob,
        citizenship: payload.citizenship,
        street_address: payload.street_address,
        city: payload.city,
        zip: payload.zip,
        annual_income: payload.annual_income,
        employment_status: payload.employment_status,
        first_name: payload.first_name,
        last_name: payload.last_name,
        email: payload.email,
        phone: payload.phone,
        tcpa_consent: payload.tcpa_consent,
        ip_address: clientIp,
        jornaya_leadid: payload.jornaya_leadid || "STATIC_JORNAYA_ID_PLACEHOLDER",
        crm_status: "pending",
        gclid: payload.click_id || null,
        utm_source: payload.utm_source || null,
        utm_medium: payload.utm_medium || null,
        utm_campaign: payload.utm_campaign || null,
        utm_content: payload.utm_content || null,
        utm_term: payload.utm_term || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to save lead" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const crmLeadToken = Deno.env.get("CRM_LEAD_TOKEN");
    const phoneFormatted = `+1${payload.phone.replace(/\D/g, "")}`;

    const crmParams = new URLSearchParams({
      first_name: payload.first_name,
      last_name: payload.last_name,
      email: payload.email,
      caller_id: phoneFormatted,
      dob: payload.dob,
      citizen_status: payload.citizenship,
      state: payload.state,
      address: payload.street_address,
      city: payload.city,
      zip: payload.zip,
      annual_income: payload.annual_income,
      employment_status: payload.employment_status,
      marital_status: "single",
      ip_address: clientIp,
      jornaya_leadid: payload.jornaya_leadid || "STATIC_JORNAYA_ID_PLACEHOLDER",
      lead_token: crmLeadToken || "",
      traffic_source_id: "2093",
      click_id: payload.click_id || "",
      utm_source: payload.utm_source || "",
      utm_medium: payload.utm_medium || "",
      utm_campaign: payload.utm_campaign || "",
      utm_content: payload.utm_content || "",
      utm_term: payload.utm_term || "",
    });

    const crmUrl = `https://quotes-direct-llc.trackdrive.com/api/v1/leads?${crmParams.toString()}`;

    console.log("CRM Request URL:", crmUrl);
    console.log("CRM Parameters:", Object.fromEntries(crmParams.entries()));

    let crmSuccess = false;
    let crmResponse: any = null;
    let crmStatus = 0;
    let crmLeadId = null;
    let errorMessage = null;

    try {
      const crmResult = await fetch(crmUrl, {
        method: "POST",
      });

      crmStatus = crmResult.status;
      console.log("CRM Response Status:", crmStatus);

      crmResponse = await crmResult.json();
      console.log("CRM Response:", crmResponse);
      crmSuccess = crmResult.ok;

      if (crmSuccess && crmResponse?.lead_id) {
        crmLeadId = crmResponse.lead_id;
      }
    } catch (error) {
      console.error("CRM API error:", error);
      errorMessage = error instanceof Error ? error.message : "Unknown error";
      crmSuccess = false;
    }

    await supabase.from("api_logs").insert({
      lead_id: leadData.id,
      transaction_id: payload.transaction_id,
      caller_id: phoneFormatted,
      request_payload: Object.fromEntries(crmParams.entries()),
      response_payload: crmResponse,
      http_status: crmStatus,
      success: crmSuccess,
      error_message: errorMessage,
    });

    if (crmSuccess) {
      await supabase
        .from("leads")
        .update({
          crm_lead_id: crmLeadId,
          crm_status: "success",
          crm_submitted_at: new Date().toISOString(),
        })
        .eq("id", leadData.id);
    } else {
      await supabase
        .from("leads")
        .update({
          crm_status: "failed",
        })
        .eq("id", leadData.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Lead submitted successfully",
        transaction_id: payload.transaction_id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
