"use client";

import { useEffect } from "react";

export default function JobPoller() {
  useEffect(() => {
    // ⚠️ JobPoller is now DISABLED
    // The automatic background polling system in background.js handles DM sending
    // using DUMMY_JOBS data (5 different recipients).
    // 
    // To re-enable manual testing, uncomment the code below:
    
    /*
    console.log("[JobPoller][TEST] Static extension test started");

    const STATIC_JOB = {
      id: "644511eb-fa5e-402d-b1a1-d83cf35d1d82",
      campaignId: "d0c11249-210f-4346-8585-8c0b7d9f236b",
      campaignName: "DM SENT AUTOMATION BY NAYAN",
      leadId: "3c1e7d17-ae90-405b-97a9-7e0abb53d729",
      recipientUsername: "sumitmishra3017",
      recipientUserId: "13986907142",
      jobType: "DM",
      message: "kem cho {{username}},now we testing the ",
      scheduledAt: "2026-01-12T12:18:06.947Z",
    };

    const payload = {
      id: STATIC_JOB.id,
      campaignId: STATIC_JOB.campaignId,
      recipientUsername: STATIC_JOB.recipientUsername,
      recipientUserId: STATIC_JOB.recipientUserId,
      message: STATIC_JOB.message.replace(
        /{{\s*username\s*}}/gi,
        STATIC_JOB.recipientUsername
      ),
      jobType: STATIC_JOB.jobType,
      meta: {
        source: "static-test",
      },
    };

    const onWindowMessage = (ev: MessageEvent) => {
      if (ev.origin !== window.location.origin) return;
      if (ev.data?.type === "SOCIALORA_JOB_STATUS") {
        console.log("[JobPoller][TEST] window message reply", ev.data);
      }
    };

    const onDomEvent = (evt: any) => {
      console.log(
        "[JobPoller][TEST] DOM event reply",
        evt?.detail
      );
    };

    window.addEventListener("message", onWindowMessage);
    window.addEventListener("socialora_job_status", onDomEvent);

    setTimeout(() => {
      console.log("[JobPoller][TEST] Sending job to extension", payload);

      window.postMessage(
        {
          type: "SOCIALORA_RUN_DM_JOB",
          job: payload,
        },
        window.location.origin
      );
    }, 1000);

    return () => {
      window.removeEventListener("message", onWindowMessage);
      window.removeEventListener("socialora_job_status", onDomEvent);
    };
    */
    
    console.log("[JobPoller] Component loaded but disabled. Background polling system is active.");
  }, []);

  return null;
}
