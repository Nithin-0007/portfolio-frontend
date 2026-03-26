// All GraphQL operations are handled by /api/graphql which calls MongoDB directly.
// No AppSync or Lambda involved — zero cold starts.

const ENDPOINT = "/api/graphql";

// In-flight deduplication — prevents duplicate simultaneous requests
const inFlight = new Map<string, Promise<any>>();

interface QueryOptions {
  cache?: RequestCache;
  revalidate?: number;
  mutation?: boolean;
}

async function executeQuery(operation: string, variables: any, options: QueryOptions = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const fetchOptions: RequestInit = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: operation, variables }),
      signal: controller.signal,
    };

    if (!options.mutation) {
      if (options.revalidate !== undefined) {
        (fetchOptions as any).next = { revalidate: options.revalidate };
      } else if (options.cache) {
        fetchOptions.cache = options.cache;
      } else {
        (fetchOptions as any).next = { revalidate: 60 };
      }
    } else {
      fetchOptions.cache = "no-store";
    }

    const res = await fetch(ENDPOINT, fetchOptions);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const result = await res.json();
    if (result.errors) {
      throw new Error(result.errors.map((e: any) => e.message).join(", "));
    }
    return result.data;
  } finally {
    clearTimeout(timeout);
  }
}

export const graphqlClient = {
  async query(operation: string, variables: any = {}, options: QueryOptions = {}) {
    const isMutation = operation.trimStart().startsWith("mutation");
    if (isMutation) return this.mutate(operation, variables);

    const key = JSON.stringify({ operation, variables });
    if (inFlight.has(key)) return inFlight.get(key);

    const promise = executeQuery(operation, variables, options).finally(() => {
      inFlight.delete(key);
    });
    inFlight.set(key, promise);
    return promise;
  },

  async mutate(operation: string, variables: any = {}) {
    return executeQuery(operation, variables, { mutation: true });
  },
};
