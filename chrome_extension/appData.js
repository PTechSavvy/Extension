const appData = {
  unapprovedApps: [
    {
      domain: "wetransfer.com",
      suggestion: "drive.google.com",
      reasons: [
        "Stores sensitive data on third-party servers",
        "No SSO integration"
      ],
      riskScore: "High (8/10)",
      vulnerabilities: [
        "CVE-2023-9972 - Token handling issue",
        "CVE-2024-1122 - Remote code execution"
      ]
    },
    {
      domain: "dropbox.com",
      suggestion: "onedrive.live.com",
      reasons: [
        "Does not support enterprise DLP policies",
        "Risk of data leakage from shared links"
      ],
      riskScore: "Medium (6/10)",
      vulnerabilities: [
        "CVE-2023-8810 - Shared link enumeration",
        "CVE-2022-4310 - Insecure file preview"
      ]
    }
  ]
};
