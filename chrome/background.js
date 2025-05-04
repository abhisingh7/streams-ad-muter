const targetAdIds = [
  "PARLE_MARIE",
  "KAMLA_PASAND",
  "VIMAL",
  "MY11C",
  "POKERBAAZI",
  "PR-25-011191_TATAIPL2025_IPL18_ipl18HANGOUTEVR20sEng_English_VCTA_NA",
  "RUPAY_SNEAKER_HRITIK", // "RUPAY_SNEAKER_HRITIK_HIN_20_20_APR"
  "GILLETTE_MACH_3", // "GILLETTE_MACH_3_HIN_20_180425"
  "RUPAY_CREDIT_CARD",
  "CAMPA",
  "POLICY_BAZAAR",
  "IPLSIDHUMOB",
  "TATAIPL2025"
];

const durationRegexes = [
  /(\d{1,3})s(?:Eng(?:lish)?|Hin(?:di)?)/i,      // "20sEng", "15sHindi", "10sHin"
  /(?:HIN|ENG|HINDI|ENGLISH)[^\d]*(\d{1,3})/i    // "HIN_10", "ENG_15"
];

console.log("Hotstar Adblocker extension loaded");
console.log("=== Ad Detection ===");

chrome.webRequest.onBeforeRequest.addListener(
  async (details) => {
    const url = new URL(details.url);
    const adName = url.searchParams.get("adName");
    console.log("=== Ad Detection started===");
    console.log(`Ad id: ${adName}`);

    if (adName) {
      const adIdMatch = targetAdIds.some((id) => adName.includes(id));

      if (adIdMatch) {
        let durationSec = 10;
        for (const regex of durationRegexes) {
          const match = adName.match(regex);
          if (match) {
            durationSec = parseInt(match[1], 10);
            break;
          }
        }

        console.log(`Muting ${adName} for ${durationSec} seconds`);

        const tabs = await chrome.tabs.query({ url: "*://*.hotstar.com/*" });

        for (const tab of tabs) {
          if (!tab.mutedInfo.muted) {
            chrome.tabs.update(tab.id, { muted: true });
          //  console.log(`Muted tab ${tab.id}`);

            setTimeout(() => {
              chrome.tabs.get(tab.id, (updatedTab) => {
                if (updatedTab && updatedTab.mutedInfo.muted) {
                  chrome.tabs.update(tab.id, { muted: false });
                //  console.log(`Unmuted tab ${tab.id}`);
                }
              });
            }, (durationSec * 1000) - 100); // some buffer for next tracking pixel
          }
        }
      }
    }
  },
  {
    urls: [
      "*://bifrost-api.hotstar.com/v1/events/track/ct_impression*",
      "*://bifrost-api.hotstar.com/v2/events/track/ct_impression*"
    ]
  }
);

// Add this new listener at the end of the file
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (details.url.includes('hotstar') && details.url.includes('ad')) {
      const url = new URL(details.url);
      const adName = url.searchParams.get("adName");
      console.log('=== Hotstar Request Detected ===');
      console.log('URL:', details.url);
      console.log('susp Ad Name:', adName);
      console.log('Timestamp:', new Date().toISOString());
      console.log('========================');
    }
  },
  {
    urls: ["*://*.hotstar.com/*"]
  }
);
