import { stripCURPs } from "@/lib/sanitize";
import type { LineResult } from "@/types";

export async function lookupCURPInDialo(curp: string): Promise<LineResult> {
  const validationBody = {
    operation: "count",
    data: {
      tipo_info_personal: curp,
    },
  };

  const validationHeaders = {
    "Content-Type": "application/json",
    Origin: "https://dialo.mx",
    Referer: "https://dialo.mx",
  };

  const validationResponse = await fetch(
    "https://p737drx1pj.execute-api.us-east-1.amazonaws.com/prod/gestion-lineas",
    {
      method: "POST",
      headers: validationHeaders,
      body: JSON.stringify(validationBody),
    },
  );

  if (!validationResponse.ok) {
    console.error(
      "Failed to validate CURP with Dialo:",
      validationResponse.statusText,
    );

    return {
      company: "Dialo",
      lines: [],
      error: "Failed to validate CURP with Dialo",
    };
  }

  const validationData = await validationResponse.json();

  if (validationData.body.data[0].total > 0) {
    console.log(
      "[dialo] registered response:",
      JSON.stringify(stripCURPs(validationData), null, 2),
    );
    return {
      company: "Dialo",
      lines: [],
      isRegistered: true,
      rawApiResponse: validationData,
    };
  }

  return {
    company: "Dialo",
    lines: [],
    isRegistered: false,
  };
}
