export const IOS_APP_USER_AGENT_TOKEN = "Chu1TestKitIOS/1";

export function isIosAppUserAgent(userAgent: string): boolean {
  return userAgent.includes(IOS_APP_USER_AGENT_TOKEN);
}
