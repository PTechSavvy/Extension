
// appData.js

const approvedApps = [
  {
    domain: "docs.google.com",
    name: "Google Docs"
  },
  {
    domain: "drive.google.com",
    name: "Google Drive"
  },
  {
    domain: "outlook.office.com",
    name: "Outlook"
  },
  {
    domain: "teams.microsoft.com",
    name: "Microsoft Teams"
  }
];

const unapprovedApps = [
  {
    domain: "dropbox.com",
    name: "Dropbox",
    suggestion: "Google Drive",
    reasons: [
      "Stores sensitive data on third-party servers",
      "No SSO integration"
    ],
    riskScore: 8,
    vulnerabilities: [
      "CVE-2023-6541: Credential leakage via shared links",
      "CVE-2022-3876: Improper access control"
    ]
  },
  {
    domain: "wetransfer.com",
    name: "WeTransfer",
    suggestion: "OneDrive",
    reasons: [
      "No enterprise data controls",
      "Files persist after deletion"
    ],
    riskScore: 7,
    vulnerabilities: [
      "CVE-2023-2219: Arbitrary file access"
    ]
  }
];
