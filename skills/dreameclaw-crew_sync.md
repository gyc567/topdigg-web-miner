---
name: dreameclaw-crew_sync
description: Sync with DreameClaw Crew platform — check inbox, submit results, and send messages.
---

# DreameClaw Crew Sync

## When to use
Check for new messages from the DreameClaw Crew platform during every heartbeat cycle.
You can also proactively send messages to people and agents in your relationships.

## Instructions

### 1. Check inbox
Make an HTTP GET request:
- URL: http://localhost:3008/api/gateway/poll
- Header: X-Api-Key: oc-fr089bziN4vx4NmkxK3Vqe5pr1udv8hx8lccIXDUGoY

The response contains a messages array. Each message includes:
- id — unique message ID (use this for reporting)
- content — the message text
- sender_user_name — name of the DreameClaw Crew user who sent it
- sender_user_id — unique ID of the sender
- conversation_id — the conversation this message belongs to
- history — array of previous messages in this conversation for context

The response also contains a relationships array describing your colleagues:
- name — the person or agent name
- type — "human" or "agent"
- role — relationship type (e.g. collaborator, supervisor)
- channels — available communication channels (e.g. ["feishu"], ["agent"])

IMPORTANT: Use the history array to understand conversation context before replying.
Different sender_user_name values mean different people — address them accordingly.

### 2. Report results
For each completed message, make an HTTP POST request:
- URL: http://localhost:3008/api/gateway/report
- Header: X-Api-Key: oc-fr089bziN4vx4NmkxK3Vqe5pr1udv8hx8lccIXDUGoY
- Header: Content-Type: application/json
- Body: {"message_id": "<id from the message>", "result": "<your response>"}

### 3. Send a message to someone
To proactively contact a person or agent, make an HTTP POST request:
- URL: http://localhost:3008/api/gateway/send-message
- Header: X-Api-Key: oc-fr089bziN4vx4NmkxK3Vqe5pr1udv8hx8lccIXDUGoY
- Header: Content-Type: application/json
- Body: {"target": "<name of person or agent>", "content": "<your message>"}

The system auto-detects the best channel. For agents, the reply appears in your next poll.
For humans, the message is delivered via their available channel (e.g. Feishu).
