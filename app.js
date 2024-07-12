
const { GMAIL, OUTLOOK } = require('./constants/env')
const { Queue, Worker } = require('bullmq');
const Redis = require('ioredis');
const generateMailReply = require('./generateMailReply')

const redisClient = new Redis({
    host: 'localhost',
    port: 6379,
    maxRetriesPerRequest: null
});

const queue = new Queue('tasks_queue', {
    connection: redisClient,
});

const worker = new Worker('tasks_queue', async job => {
    const data = JSON.parse(job.data);
    const { email, password, host } = data;
    try {
        await generateMailReply(email, password, host);
        console.log(`Processed task for ${email}`);
    } catch (error) {
        console.error(`Failed to process task for ${email}: ${error.message}`);
    }
}, {
    connection: redisClient,
});

async function scheduleMailTasks() {
    try {
        const Tasks = [
            { email: GMAIL.EMAIL, password: GMAIL.PASSWORD, host: GMAIL.HOST },
            { email: OUTLOOK.EMAIL, password: OUTLOOK.PASSWORD, host: OUTLOOK.HOST },
        ];

        await Promise.all(Tasks.map(task => queue.add("tasks_queue", JSON.stringify(task))));

        console.log('Tasks scheduled successfully.');
    } catch (error) {
        console.error('Failed to schedule tasks:', error);
    }
}

worker.on("ready", () => {
    console.log("worker started")
    scheduleMailTasks();
    setInterval(scheduleMailTasks, 30 * 1000);
})

process.once('SIGTERM', async () => {
    await Promise.all([
        worker.close(),
        redisClient.disconnect(),
    ]);
    process.exit(0);
});  
