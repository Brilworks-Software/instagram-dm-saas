declare module 'instagram-id-to-url-segment' {
  /**
   * Converts an Instagram URL segment (shortcode) to an Instagram media ID
   * @param urlSegment - The Instagram post shortcode (e.g., "ABC123")
   * @returns The Instagram media ID as a string
   */
  export function urlSegmentToInstagramId(urlSegment: string): string;

  /**
   * Converts an Instagram media ID to a URL segment (shortcode)
   * @param id - The Instagram media ID (as string or number)
   * @returns The Instagram post shortcode
   */
  export function instagramIdToUrlSegment(id: string | number): string;
}
