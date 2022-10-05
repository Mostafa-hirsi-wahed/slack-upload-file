import * as core from "@actions/core";
import * as glob from "@actions/glob";
import * as slack from "@slack/web-api";
import * as fs from "fs";
import * as path from "path";

const defaultMaxRetryCount = 3;

interface Option {
    slackToken: string;
    slackApiUrl: string | undefined;
    channels: string | undefined;
    message: string | undefined;
}

function getInput(key: string): string {
    return core.getInput(key, { required: true });
}

function getInputOrUndefined(key: string): string | undefined {
    const result = core.getInput(key, { required: false });
    if (result.length == 0) {
        return undefined;
    }
    return result;
}

function getInputNumberOrUndefined(key: string): number | undefined {
    const value = getInputOrUndefined(key);
    if (value == undefined) {
        return undefined;
    }
    return parseInt(value);
}

function readOption(): Option {
    return {
        slackToken: getInput("slack_token"),
        slackApiUrl: getInputOrUndefined("slack_api_url"),
        channels: getInputOrUndefined("channels"),
        message: getInputOrUndefined("message"),
    };
}

async function run() {
    try {
        const option = readOption();
        const client = new slack.WebClient(option.slackToken, {
            slackApiUrl: option.slackApiUrl,
            retryConfig: { retries: defaultMaxRetryCount },
        });
        const result = await client.chat.postMessage({
            text: "Hello world!",
            channel: "test-message-channel",
        });

        if (result.ok == false) {
            core.setFailed(result.error ?? "unknown error");
            return;
        }
        core.setOutput("response", JSON.stringify(result));
    } catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        }
    }
}

run();
