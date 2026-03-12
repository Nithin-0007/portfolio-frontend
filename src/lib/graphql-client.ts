export const graphqlClient = {
  async query(operation: string, variables: any = {}) {
    const endpoint = "https://7ndr735sxfcqfmxx34c2efwbdm.appsync-api.us-east-1.amazonaws.com/graphql";
    const apiKey = process.env.NEXT_PUBLIC_APPSYNC_API_KEY;

    if (!endpoint || !apiKey) {
      console.warn('AppSync credentials missing. Falling back to local/REST.');
      return null;
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({ query: operation, variables }),
    });

    const result = await res.json();
    if (result.errors) {
      throw new Error(result.errors.map((e: any) => e.message).join(', '));
    }
    return result.data;
  },
};
