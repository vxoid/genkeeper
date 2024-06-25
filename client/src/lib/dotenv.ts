import * as dotenv from 'dotenv';

dotenv.config({ path: "../.env" });

export const genKeeperAddress = `http://${process.env.AI_HOST}:${process.env.AI_PORT}`;
export const videoStorage = `../${process.env.VIDEO_STORAGE || "video_storage"}`;