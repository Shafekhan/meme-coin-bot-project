import axios from "axios";

export interface RedditPost {
    contents: string;
    id: string;
    createdAt: string;
}

export async function getPosts(subreddit: string = "CryptoMoonShots"): Promise<RedditPost[]> {
    try {
        const response = await axios.get(`https://www.reddit.com/r/${subreddit}/new.json?limit=10`);

        const posts: RedditPost[] = response.data.data.children.map((post: { data: any }): RedditPost => ({
            contents: post.data.title.trim(), 
            id: post.data.id,
            createdAt: new Date(post.data.created_utc * 1000).toISOString()
        }));

        const sixHoursAgo = Date.now() - 10 * 60 * 60 * 1000;
        const filteredPosts: RedditPost[] = posts.filter((post: RedditPost) => new Date(post.createdAt).getTime() > sixHoursAgo);

        console.log("Filtered Posts:", filteredPosts.map((p: RedditPost) => p.contents));

        return filteredPosts;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error fetching Reddit posts:", error.message);
        } else {
            console.error("An unknown error occurred while fetching Reddit posts.");
        }
        return [];
    }
}
