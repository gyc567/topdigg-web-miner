---
title: "40,000-star magpie: Stop Configuring API Keys Tool by Tool, This Gateway Connects Every Model to Every AI Tool"
date: "2026-11-23"
description: "magpie gathers scattered API keys, subscriptions and local models into one list, then writes it into any AI tool via a unified gateway."
author: "瑞哥观势"
tags:
  - open-source-project-analysis
  - ai-tools
  - model-gateway
  - cost-optimization
  - tutorial
categories:
  - AI应用
keywords:
  - magpie
  - AI tools
  - model gateway
  - API key
  - routing group
  - privacy masking
  - cost optimization
source:
  original:
    name: "瑞哥观势"
    url: "https://mp.weixin.qq.com/s/xxxxx"
---

# 40,000-star magpie: Stop Configuring API Keys Tool by Tool, This Gateway Connects Every Model to Every AI Tool

**Conclusion first:** magpie is a unified entry point built for people who use a lot of AI tools. It does not provide models itself. It does three things: it collects the model sources you already have (API keys, logged-in subscriptions, local models) into one list; it writes the models from that list into the config of any AI coding tool with one click; and it runs a local gateway on your machine so that models from different vendors can be called by any tool.

**Its value is not that it is "stronger", but that it "saves money, saves effort, and stops you from being locked into a single vendor".** You have three subscriptions and five API keys. Before, that meant five config files and five base URLs to remember. After installing magpie, they become one list: use whichever is fastest, use whichever is cheapest.

**This article is a step-by-step tutorial written for a complete beginner who runs a business.** You do not need to write code, only to copy and paste commands and click with the mouse.

---

**Part One: First figure out what magpie actually does for you**

Before you do anything, you need to understand three terms. Once you understand these three, the whole article clicks.

**① Agent (tool)**: the software you normally use to talk to AI and get work done. Claude Code, Codex, Gemini CLI, OpenCode, Cursor CLI, Cline, OpenClaw, Windsurf, the Chat in the Cursor editor, dozens of them. Each Agent natively understands only its own configuration format.

**② Provider (model source)**: where the models come from. Three forms:

- **API key**: the interface key you buy and top up on the official site of DeepSeek, Kimi, Zhipu, MiniMax, OpenAI, Anthropic, a string of characters starting with `sk-`;
- **Subscription**: the Claude Pro/Max, ChatGPT Plus/Pro, GitHub Copilot accounts you have already logged into in Claude Code. magpie can read the accounts already logged in on your machine and share their models with other tools;
- **Local model**: models running on your own machine via Ollama or LM Studio, no key needed.

**③ Gateway**: a local service magpie opens on your computer at `127.0.0.1:3425`. All Agents get pointed at it, and it forwards requests to the vendor that actually serves the model, translating between OpenAI format, Anthropic format and Gemini format along the way. **You do not need to understand the technical details, you only need to know this: from now on every tool has a single exit.**

**Before you install, your current setup looks like this:**

```
Claude Code  →  Anthropic official site  →  your Claude subscription
Codex        →  OpenAI official site    →  your ChatGPT subscription
Cline        →  DeepSeek official site  →  one DeepSeek key
OpenClaw     →  Kimi official site      →  one Kimi key
```

**After you install:**

```
Claude Code ─┐
Codex       ─┼→  magpie local gateway  →  { Anthropic, OpenAI, DeepSeek, Kimi, ... }
Cline       ─┤
OpenClaw    ─┘
```

**Core benefit: switching models no longer means editing config files, one change applies to the whole setup; when one vendor's quota runs out it switches to the next automatically, so your AI tool never throws an error in front of the boss.**

---

**Part Two: Zero-basics preflight check (5 minutes)**

Before installing, confirm three things.

**Check 1: What is your system.**
macOS (the kind with a menu bar icon), Windows (tray at the bottom right), Linux (desktop version or pure terminal version). Not sure is fine too, the tutorial covers all three.

**Check 2: You have at least one model source.**
A subscription (Claude / ChatGPT / Copilot, any of them) is best; if not, go to the DeepSeek or Kimi official site and open an API key account, which works smoothly with domestic payments and costs only a few yuan to get going. **Note: magpie itself is free and open source, but it does not give away models.** Having no model source is like buying a router without connecting the broadband.

**Check 3: You already have at least one AI tool installed.**
If you have not installed any AI coding tool, the Agents page in magpie will be empty. Install Claude Code or Cursor first, then come back.

**One-line checklist:**
- [ ] One AI tool is installed and can hold a normal conversation
- [ ] You have an API key or a subscription account at hand
- [ ] You know whether your system is Mac / Windows / Linux

---

**Part Three: Step one, installation**

**3.1 The easiest route (recommended for absolute beginners)**

Open a browser, go to `usemagpie.ai`, download the installer package for your system, and double-click to install. The Mac package is signed and notarized by Apple; the Windows and Linux packages also carry GitHub Actions build provenance.

**Why recommend this?** Because it bypasses every possible error in the terminal. If you want to verify that the downloaded file really is an official build, you can run this in the terminal (GitHub CLI required first):

```bash
gh attestation verify magpie-darwin-arm64.dmg -R yetone/magpie-releases
```

It shows the workflow and run that built it, and fails if the file did not come from an official build.

**3.2 One-line terminal install**

If you are used to the command line (recommended for Mac and Linux users):

```bash
curl -fsSL https://usemagpie.ai/install.sh | sh
```

This single command does three things: downloads the build for your system, installs it, and puts the `magpie` command on your PATH.

**3.3 Add a proxy if you are on a domestic network**

If your network cannot reach the official site or GitHub, add parameters:

```bash
curl -fsSL https://usemagpie.ai/install.sh | sh -s -- --proxy http://127.0.0.1:7890
```

Replace `7890` with the port of your own proxy tool. Four protocols are supported: http, https, socks5, socks5h. If you have a GitHub download mirror, you can also add `--mirror https://your-mirror-prefix/`. **Do not worry: whichever route you take, the SHA-256 checksum of the downloaded file always comes from the official site, and a mirror that tampered with the file will be rejected outright.**

**3.4 Special notes for Linux users**

On Linux the install script decides by itself:

- You have a graphical desktop and WebKitGTK 4.1 is already installed → it installs the **desktop version** (with a window and a tray icon);
- You have a graphical desktop but WebKitGTK 4.1 is missing → the script installs it with your package manager (it will ask for your sudo password), then installs the desktop version;
- You have no desktop (pure server) or you do not want to use sudo → it installs the **terminal version**, command line interface only.

Specify the version yourself:

```bash
curl -fsSL https://usemagpie.ai/install.sh | sh -s -- --gui    # force the desktop version
curl -fsSL https://usemagpie.ai/install.sh | sh -s -- --tui    # force the terminal version
```

**3.5 Verifying a successful installation**

Open the terminal (on Mac the "Terminal" app, on Windows PowerShell) and type:

```bash
magpie --version
```

If a version number comes out, the install worked.

Then type this one, it lists every AI tool on your machine together with its current configuration:

```bash
magpie ls
```

**Once you see this table, the installation is a success.** This table is the dashboard you will watch every day from now on.

---

**Part Four: Step two, add your model sources**

Open magpie. On macOS click the icon in the top-right menu bar, on Windows click the tray icon at the bottom right and choose "Open magpie" from the right-click menu.

**4.1 Add an API key vendor (the most common case)**

1. Click the **Providers** tab at the top;
2. Click **＋ Add provider**;
3. The panel that pops up is a row of vendor icons, find the one you bought a key from (DeepSeek, Kimi, Zhipu, MiniMax, Alibaba Bailian, Volcano Ark, Tencent Hunyuan, SiliconFlow, OpenRouter, xAI, OpenAI, Anthropic, Gemini and more are all there);
4. Click it, paste your key into the input box, and save.

**Where do I get each vendor's key?** Every vendor has a small "Get a key ↗" arrow next to it, click it and it jumps straight to that vendor's key management page. **Never buy keys from any third-party page, only from the vendor's official site.**

**4.2 Log in with subscription accounts (the cheapest way to use it)**

In the same Add provider panel, click a subscription card such as **Claude**, **ChatGPT**, **GitHub Copilot** or **Gemini Code Assist**, and magpie automatically opens the vendor's official login page so you can authorize the login. **Once you are logged in, your subscription becomes a Provider**, and the models inside it can be used by any tool.

There is a very important mechanism here: **one subscription can hold multiple accounts.** For example, if you have 2 Claude accounts and 1 ChatGPT account, clicking the Claude card one more time adds the second account. magpie distributes requests among them automatically, switching to the next one when one is used up, so you will never see a "quota exhausted" error.

**Important reminder (the official docs say this explicitly):** Claude subscription requests are forwarded through the Claude Code installed on your machine, so you must keep Claude Code on the machine and not delete it. Google may also apply risk control because the account is used outside Antigravity, **so use an Antigravity account for experiments, not your main account.**

**4.3 Local models**

If you have installed Ollama or LM Studio, choose **Ollama** or **LM Studio** in the Add provider panel. No key is needed, just fill in a port (Ollama defaults to 11434). **Mind the cost: local models are free, but slow.** Use them as a fallback for daily work, not as your main workhorse.

**4.4 Any compatible endpoint (the universal option)**

If you use another service, as long as it is compatible with the OpenAI or Anthropic format, choose **Custom** and fill in three things: a name, the base URL (for OpenAI compatible endpoints it ends with `/v1`, for Anthropic compatible ones use the root address), and the key. magpie gives every API the interface format it can speak, so you use the one you need and magpie translates the other.

**4.5 Import existing configurations (the big time saver)**

At the top of the Add provider panel there is an **Import…** button. Clicking it reads the configurations in your Claude Code `settings.json`, Codex `config.toml`, CC Switch and Alma, and moves the model sources inside them straight into magpie. **It only reads, never writes, your original files stay untouched.** If you have already configured a pile of keys, this step saves you half an hour.

**4.6 Key security note**

**magpie stores your keys in `~/.config/magpie/providers.json`, readable only by you.** It **does not** read keys from your shell environment variables. It uses exactly what you add, and will not silently reuse other keys you have `export`ed. This design is very restrained and worth trusting.

---

**Part Five: Step three, pick a model for each tool**

**5.1 Doing it in the graphical interface**

1. Click the **Agents** tab at the top;
2. Each row on the page is one AI tool, and the column on the right shows the model it is currently using;
3. **Click that model name** and a searchable list pops up, divided into three groups: the tool's own models, your routing groups, and every model under every provider you added;
4. Click the model you want directly, or type a keyword to filter.

**The moment you click, magpie has already rewritten that tool's configuration file.** It touches only the one key that needs changing, and comments, ordering and indentation are all preserved exactly, with an atomic write (you will never end up with half a file after a power cut).

**5.2 Which files it actually changes**

This table is worth a look from the boss, because it is the evidence that "magpie will not break your stuff":

| Tool | Configuration file that gets modified |
|------|------------------|
| Claude Code | `~/.claude/settings.json`: writes ANTHROPIC_BASE_URL, ANTHROPIC_AUTH_TOKEN and the model field |
| Codex | `~/.codex/config.toml`: adds a `[model_providers.magpie]` section and the model settings |
| Gemini CLI | `~/.gemini/settings.json` and `~/.gemini/.env` |
| OpenCode | `~/.config/opencode/opencode.json(c)` |
| Cursor CLI | `~/.cursor/cli-config.json` |
| Cline / Roo / OpenClaw and others | each tool's own agreed config file |
| VS Code Chat, Zed, JetBrains | the editor's own settings file |

**Everything is "change one key", not "rewrite the whole file".**

**5.3 Command line operation (faster)**

```bash
magpie claude deepseek/deepseek-v4-pro      # let Claude Code use DeepSeek
magpie codex moonshot/kimi-k2.5             # let Codex use Kimi
magpie opencode anthropic/claude-sonnet-5   # let OpenCode use Claude
magpie codex effort high                    # also raise the reasoning effort
```

**The model name format is `vendor/model-name`**, for example `deepseek/deepseek-chat`, `moonshot/kimi-k2.5`. Use `magpie models` to list all models currently available to your Agents.

**5.4 The most critical step: open a new session**

**This is where 90% of people get stuck the first time:** an already open session does not switch models. Agents read the configuration file at startup.

So: **after picking a model, exit the current session and open a new one.** Codex users also have to fully quit and reopen the Codex app (its model list is generated at startup).

**5.5 How to confirm it really took effect**

```bash
magpie ls
```

See whether the model shown after that tool row has changed. If it changed, you are good.

**Or look at the usage page**: magpie has a Usage tab that shows how many tokens and how much money each tool and each model consumed, and which provider served the request. **This page is the basis for your cost review from now on.**
---

**Part Six: Step four (optional but strongly recommended), routing groups, letting quotas hand off automatically**

If you have more than one model source (two subscriptions, or a subscription plus an API key), you should not let a tool recognize only one model. **Automatic switching to the next source when the quota runs out is magpie's most commercially valuable feature.**

**6.1 One model, several sources**

Suppose you have a Claude subscription, plus Copilot, plus an Anthropic API key, and they all serve the Opus series. magpie automatically groups them under a name like `auto/claude-opus-4.6`. Just pick that group in your Agent and the requests are distributed among those sources automatically.

**6.2 Creating a group manually**

From the command line:

```bash
magpie group add "Opus anywhere" models=claude/claude-opus-5-5,copilot/claude-opus-5.5 routing=smart
magpie claude group/opus-anywhere
```

**6.3 There are 9 routing strategies, which one should you pick?**

| Strategy | Behavior | When to use it |
|------|------|-----------|
| **smart (intelligent, default)** | Prefers the subscription that is about to reset but not yet used up, so nothing is wasted | Daily boss work, **default to this** |
| order (in order) | Uses the first one until it cannot be used, then moves to the next | You have one flagship model you strongly prefer |
| rotate (rotation) | Switches to another source on every round of requests | You want to consume every account's quota evenly |
| usage (least used first) | Whoever has the most left gets used | Quota levels differ a lot across accounts |
| pace (expiring soonest first) | Whoever expires this week and loses the most gets used first | You do not want subscriptions to expire at month end |
| weight (by weight) | Splits traffic by the ratio you set | You want to send more traffic to cheap models |
| fast (speed first) | Whoever answered fastest recently gets used | Scenarios sensitive to response speed |
| cheap (cheapest first, group only) | Whichever is cheapest gets used | **Pure cost optimization, what a boss should use** |

**A blunt recommendation for the boss: use `smart` for daily work, and use `cheap` for batch jobs and unattended tasks.** Cheap models handle the rough work, expensive models are reserved for work that needs judgment, and that is where real AI cost reduction and efficiency gains come from.

**6.4 Quota dashboard**

```bash
magpie quota
```

This command tells you how much is left on every subscription and every key, and when it resets. **Look at it once a week.** Subscription quota is money you throw away, one glance tells you whether to switch models.

---

**Part Seven: Step five (optional), profiles, one-click switching of working modes**

**Scenario**: use cheap models for daily tasks during the day, use the strongest model at night to rework a complex architecture; or you need to switch between "my own Claude subscription" and "the company's API key". Editing configs by hand is a pain.

At the bottom of the Agents page click **＋ Save current** and store the current configuration of all tools as a profile, for example named "savings mode" and "battle mode". From then on, click the profile once and every tool switches over at the same time.

```bash
magpie save work      # save the current configuration of all tools as the profile work
magpie use work       # switch back to work
magpie profiles      # see which profiles exist
```

**The real value of this feature for a boss: it turns "AI usage" into a controllable management action.** In a team you can see who is using which model, how much it cost, and switching profiles is how you keep it in check.

---

**Part Eight: Step six (strongly recommended), privacy masking**

**This section is in my view the most valuable part of the whole tutorial, please read it carefully.**

**What is the problem?** Your AI tools pack whatever they read into the prompt and send it out, including the `.env` file in your project, config files, and tokens in logs. If your prompt accidentally carries an API key, a password, a customer email, then it goes to the model vendor exactly as it is.

**What magpie does (works out of the box, completed locally):**

1. You turn on masking in **Settings → Privacy** (it is off by default, **remember to turn it on manually**);
2. magpie replaces values such as keys, passwords and emails with placeholders **on your own computer**, for example `{{API_KEY_k3v9x2mq}}`;
3. What goes out is the placeholder, **the vendor never sees your real key**;
4. The model reply comes back with the placeholder in it, magpie swaps the real value back locally, and the tool works as usual.

**A few design details that show this was not done casually:**

- The same value always maps to **the same placeholder**, so conversation context, prompt cache and thinking signatures are not invalidated;
- The value **only exists in memory**, on disk only the "type, length, first few characters" are recorded, never the value itself;
- If masking is on but cannot run, the request is **held back and not sent** (it returns 503) instead of sending the raw text out;
- Built-in rules cover API keys, private keys, tokens, emails, and card numbers and ID numbers that pass a checksum; you can also configure your own keywords and regular expressions;
- Every modified request can be compared side by side in **Insights → Masking**: what you changed and what the vendor actually saw.

**The cost should be stated clearly:** the model sees `{{API_KEY_xxx}}` instead of the real key, so it cannot answer questions like "why was this token rejected". Values like that should go into the Never mask list. **This is the common flaw of every security solution, being aware of it is enough.**

**One sentence from the boss's perspective: this single switch is what lets a company dare to feed real business data to AI.** Without it, your engineers will sooner or later send production secrets to a model vendor.

---

**Part Nine: Troubleshooting (just follow along)**

**Question 1: The Agent reports a 502, or cannot connect, and the Routing page in magpie is empty.**

**This is the most common pitfall in China, 90% of the time your proxy tool causes it.** Your Surge / Clash / mihomo has the system proxy or TUN mode on, so requests destined for `127.0.0.1:3425` also get proxied, and magpie never receives them.

**The fix: add a direct rule for the local address, placed in front of all your other rules.**

Surge:
```
IP-CIDR,127.0.0.0/8,DIRECT,no-resolve
IP-CIDR6,::1/128,DIRECT,no-resolve
```

Clash / mihomo (under `rules:`, add a `-` in front of each line):
```yaml
- IP-CIDR,127.0.0.0/8,DIRECT,no-resolve
- IP-CIDR6,::1/128,DIRECT,no-resolve
```

After changing it, send a new request to the Agent. **Remember this fix, it will save you two hours.**

**Question 2: I switched models but the Agent still uses the old one.**

Three reasons: ① the session was not reopened; ② Codex was not restarted; ③ you changed the tool's config file but the tool reads a different environment variable.

Try in this order: close the current session → open a new session → if that does not work, fully quit the Codex app and start it again.

**Question 3: After I change the magpie config, will the settings I edited by hand be lost?**

No. magpie re-reads the file every time and only touches its own few keys. Your own comments, other config items and indentation are all preserved.

**Question 4: How do I restore a tool to its original state?**

```bash
magpie claude default
```

It undoes what it wrote and restores your original values such as `ANTHROPIC_BASE_URL`. Picking that tool's own model in the graphical interface has the same effect.

**Question 5: Does magpie have to stay running?**

**If you use models through magpie, yes it must be running.** The gateway runs together with the app.

Three ways to keep it resident:

```bash
magpie tray              # keep only the menu bar / tray icon (put it into autostart)
magpie serve             # run only the gateway, no window
magpie daemon install    # install as a system service, systemd on Linux, launchd on Mac, autostart at boot
```

`magpie daemon install --web` can also bring up the web interface at the same time. **The boss's advice: use `magpie daemon install` to make it a service, do not rely on clicking the icon yourself.**

**Question 6: On Linux the install only gave me the terminal interface and I want the desktop version.**

Install WebKitGTK 4.1 as prompted:

```bash
sudo apt install libwebkit2gtk-4.1-0     # Debian / Ubuntu
sudo dnf install webkit2gtk4.1            # Fedora
sudo pacman -S --needed --noconfirm webkit2gtk-4.1   # Arch
sudo zypper install libwebkit2gtk-4_1-0   # openSUSE
```

Run the install script once more afterwards.

**Question 7: How do I uninstall completely and put my tools back the way they were?**

```bash
curl -fsSL https://usemagpie.ai/install.sh | sh -s -- --uninstall
```

It first disconnects all Agents and restores their original configurations, then deletes what it installed. **Your settings and providers stay in `~/.config/magpie`, only `--purge` deletes them together.**

**Question 8: What do I do when I change computers?**

```bash
magpie backup                       # back up (it asks you to set the password twice)
magpie restore magpie.magpie-backup # restore on the new computer
```

You can also sync to WebDAV, S3 or an encrypted GitHub repository in the settings. **The backup file contains no API keys by default**, you need to set a passphrase to take the keys with you.

---

**Part Ten: Advanced options (good to know, do not do them yet)**

**10.1 Let every tool search the web**

magpie has built-in interfaces for a bunch of search engines (Tavily, Brave, Exa, Firecrawl, DeepSeek search, Doubao, Tencent Yuanbao and more). You configure them in the settings, then attach them to any Agent as MCP, and the Agent gets both a `web_search` and a `web_fetch` tool. **Note: this costs money**, each vendor bills its own key separately.

**10.2 Let every tool draw images**

magpie provides an image generation tool, using the model you specify, attached to any Agent through MCP.

**10.3 Run it on a NAS or server**

```bash
docker run -d -p 3430:3430 ghcr.io/yetone/magpie
```

Then manage it with the browser. **It works well as a shared model gateway for a team**, and combined with "Share on local network" other machines on your LAN can use it too, with an independent key for each client plus daily, weekly and monthly token and spend limits. **This one is very valuable for a company with a development team: it is like putting a master switch on the whole company's AI spending.**

**10.4 Use plugins**

magpie supports plugins (running on Bun) and the community has a ready-made marketplace. Plugins can supply models (login style plugins for example) and can also act as gateway middleware, rewriting requests, filtering sensitive words and mapping model names.

**10.5 Let other tools connect as well**

Any tool that supports a custom base URL can use it, and the exported environment variables look like this:

```bash
export OPENAI_BASE_URL=http://127.0.0.1:3425/v1
export OPENAI_API_KEY=magpie
export ANTHROPIC_BASE_URL=http://127.0.0.1:3425
export ANTHROPIC_API_KEY=magpie
export GOOGLE_GEMINI_BASE_URL=http://127.0.0.1:3425
export GEMINI_API_KEY=magpie
```

---

**Part Eleven: Does magpie send your data out? (bosses must read this part)**

**Conclusion: your prompts, replies, keys and accounts only go to the model vendors you chose yourself, magpie has no server standing in the middle.** It is just a local forwarder.

**By default it reports usage statistics once a day**, including: a random id (generated on your machine), the version number, system information, which agents / providers / models you used (using magpie's own ids, providers you added yourself are only marked as custom), which plugins are installed and which marketplace MCPs are used. **It contains no names, URLs, accounts, keys, prompts or usage details.**

**How to turn it off** (pick one of three):
- Turn off each item in Settings → Privacy;
- Set the environment variable `DO_NOT_TRACK=1`;
- Set the environment variable `MAGPIE_NO_STATS=1`.

**Two more things you should know:**

- It reads the login information of Claude Code and Codex already logged in on your machine (from the keychain). If you do not want it to: **turn off Subscription accounts in Settings → Privacy**, or run `magpie accounts discovery off`. **API key type providers are unaffected and keep working as usual.**
- The official documentation lists everything that is reported in `/docs/privacy`.

**The boss's decision criterion: if your company has legal requirements about "data leaving the country", go read that page.** It is written in more detail than most products of its kind, including things like plugin icons going through a Cloudflare proxy and only click counts being counted without keeping ids. **This is a plus, not a minus.**

---

**Part Twelve: Finally, what does this whole setup mean for a boss**

The technical part is done, let us talk about something practical.

**First layer, the money.**
How many AI subscriptions do you have right now? Does the monthly bill add up? The Usage page in magpie breaks down the spend of every tool, every model and every key, and combined with the `smart` and `cheap` routing strategies, **saving 30% to 60% on the same work is normal**, because in the past you could only use one model for everything, now you can route by task difficulty.

**Second layer, the people.**
A new engineer no longer has to ask "where is the key, how do I fill in the base URL", one command `magpie claude deepseek/deepseek-chat` does it. **What this saves is the cost of "every new hire spending two days setting up their environment".**

**Third layer, the assets.**
Your model sources (subscriptions, keys, configs) now have a backup-able, portable list. `magpie backup` takes it away in one command, so changing computers or handing over to someone else no longer means "only one person knows where the keys are".

**Fourth layer, the risk.**
Privacy masking blocks, inside your own company, the almost-certain event of an engineer accidentally sending a production secret to a model vendor. **In my view this one item is worth the sum of the three above.**

**Fifth layer, and the most important one: you are not locked in.**
Today OpenAI cuts prices, tomorrow Anthropic raises them, the day after a very strong new model appears. With magpie installed, changing vendor is one click, not a company-wide config refactoring project. **This is the ability to turn "AI tools" from a fixed asset into a variable cost.**

---

**Part Thirteen: Rollout advice (do not do it all at once)**

**Day 1**: install magpie, add one API key, change only one tool (Cline for example) and let it run for a day. Confirm it works, then continue.

**Day 2**: log in the other subscriptions you have, create two routing groups: `cheap` for daily work, `smart` for hard battles. Teach yourself `magpie quota` and the Usage page.

**Day 3**: turn on privacy masking. Set up a Profile for all your tools (savings / hard battle). Run `magpie ls` once and archive it as the standard configuration baseline for the team.

**Week 2**: if the team has more than three people, turn on LAN sharing with an independent key and spend limit per client. After this step you have full control over AI spending.

**What not to do:** do not change the config of 20 tools at once and restart them all, you will not be able to troubleshoot. Change one at a time, verify after each change.

---

**Final summary**

magpie got more than 40,000 stars not because it lets you use a stronger model, but because it solves something every single person has been annoyed by: **the hell of pairing models with tools.**

Translated into words a boss understands, it is four sentences:

**First, it collects scattered model sources into one list. Second, it turns "switching models" from editing a config into one click. Third, when the quota runs out it hands off automatically, so the tool never throws an error in front of you. Fourth, before your data leaves the building, it swaps your secrets out on your own computer.**

The first three sentences are efficiency, the fourth is security. **All four sentences together are the entire reason I recommend you spend an afternoon installing it.**

---
Eric|瑞哥
广东 深圳

✅前IBM架构师｜区块链书《区块链核心技术与应用》合著作者
技术代码仓库:https://github.com/gyc567
个人网站:www.topdigg.com
💼新加坡资管公司前CTO
👉公众号「瑞哥观势」主理人
💎聚焦在:创富和守富
🎯专注老板群体：用AI 降本增效
微信:360369487

---

**🏢 Enterprise AI: KumoAI, a custom knowledge base for your company**

I turned enterprise AI rollout into a product of my own: **KumoAI, the enterprise-grade AI work hub**.

Your knowledge, business data and customer data stay on your own hardware, deployed privately, so nothing ever leaves the building. It is not another chat tool, but a system of digital employees that keeps evolving and improving as your business scales: documents become searchable and callable, the more it is used the better it understands your company's own definitions and playbook, and know-how stops sitting in one person's head and starts living in the system.

Website: kumolabsai.com

---


在这个快节奏的时代，我依然相信面对面、小范围、高浓度的链接力量。

我致力于搭建一个"去泡沫化"的老板圈子，重点关注：

🔹 电商全域：国内直播、跨境电商与出海项目孵化

🔹 创投与产投：金融银行资源对接、企业融资与并购

🔹 内容生态：MCN机构、达人矩阵与品牌整合

🔹 组织建设：企业核心团队搭建、高管寻访

**【我的线下局】**

不办大会，只办"小会"。

✅ 创业私董会：深度剖析商业难题

✅ 老板闭门饭：链接同频灵魂，甚至解决人生大事（高质量单身圈层）

✅ 行业沙龙：聚焦具体赛道，促成实质合作

**筛选标准：**

只欢迎有结果、有边界感、有长期主义心态的创始人/合伙人。

时间宝贵，只留给有价值的人。
