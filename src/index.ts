require("dotenv").config();
import { getTokenFromLLM } from "./get-token-from-llm";
import { getPosts, RedditPost } from "./get-posts"; 
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { swap } from "./swap";

const SOL_AMOUNT = 0.001 * LAMPORTS_PER_SOL;

async function main(subreddit: string = "CryptoMoonShots") {
    try {
        const newPosts = await getPosts(subreddit);
        console.log(`Retrieved ${newPosts.length} new posts from r/${subreddit}`);

        for (const post of newPosts) { 
            const tokenAddress = await getTokenFromLLM(post.contents);
            if (tokenAddress !== "null") {
                console.log(`Analyzing post => ${post.contents.substring(0, 100)}...`);
                const analysis = await swap(tokenAddress, SOL_AMOUNT);
                console.log('Swap Analysis:', analysis);
            }
        }
    } catch (error) {
        console.error('Error in main execution:', error);
    }
}

setInterval(() => {
    main().catch(console.error);
}, 5 * 60 * 1000);

main().catch(console.error);