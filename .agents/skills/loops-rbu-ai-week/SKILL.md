---
name: loops-rbu-ai-week
description: >-
  Build for the RBU AI Assignment hackathon on Loops House: ideate with the AI
  mentor, query sponsor knowledge graphs (graph-RAG over their docs), create
  and update the project submission, save ideation artifacts, and evaluate the
  project against each sponsor's judging criteria. Use this skill whenever the
  user mentions RBU AI Assignment, this hackathon, its sponsors or bounties,
  submitting or improving their hackathon project, sponsor docs/SDKs, judging,
  or asks "what should I build" — even if they never say "loops".
requires_bin: loops
---

# RBU AI Assignment — Loops House skill

You are helping a builder compete in ONE hackathon: `rbu-ai-week`. This skill carries everything you need — the event data, ready-to-run `loops` commands, and the workflow below. Commands are pre-filled with the right slugs; only replace `<angle-bracket>` placeholders. Never invent or substitute ids: a user has at most one project per hackathon (being a team member counts), so the platform always resolves *their* project from the session — no project id exists anywhere in this skill.

The user has no project here yet. Create one with `loops project create` when they're ready to submit; until then, ideate freely.

## How to work

Follow this sequence — each step's output feeds the next:

1. **Check auth** with `loops auth status` before any other command or at the start of a session. Sessions expire; assuming one exists wastes the user's time on confusing failures.
2. **Orient**: read the event data below (stage, deadlines, sponsors). Run `loops project get --hackathonSlug rbu-ai-week` to see where the user's submission stands.
3. **Ideate or research**: brainstorm with the mentor (`hackathon ideate`) and ground sponsor-specific facts with `knowledge query` — never assert what a sponsor's SDK does from memory when you can cite their knowledge graph.
4. **Persist**: save promising directions as artifacts; create or update the submission as the project takes shape.
5. **Evaluate before the deadline**: run `loops evaluate` per targeted sponsor and act on the feedback — that's what the judges will probe.

Command outputs are structured (add `--json` for machine-readable form) and often end with a **suggested next command (CTA)** — prefer following it over guessing. On `NOT_AUTHENTICATED`, run the auth flow; on `credits_exhausted`, stop and tell the user (don't retry).

## Authentication

```sh
loops auth status                        # run FIRST — who am I?
```

If not authenticated, the CLI isn't installed-and-logged-in yet. Install once with `npm install -g loopshouse`, then offer the user these login options:

- **Google**: `loops auth login --provider google` — opens the browser.
- **GitHub**: `loops auth login --provider github` — opens the browser.
- **Email one-time code**: `loops auth login --email <you@example.com>` sends a 6-digit code, then `loops auth verify --email <you@example.com> --code <123456>`.

In headless contexts the browser flows print a URL for a human to open. Re-run `loops auth status` to confirm before continuing.

## Event & sponsor data

Your ground truth for this event, as one TOON document (TOON = compact JSON: `key: value` lines; a uniform array renders as a `name[N]{col1,col2,…}:` header followed by one comma-separated row per element):

```toon
hackathon:
  slug: rbu-ai-week
  name: RBU AI Assignment
  tagline: "From your first API call to your first real build, in one week."
  theme: null
  stage: build_open
  stageMeaning: Building phase — submissions are OPEN until the end date
  timezone: Asia/Calcutta
  startsAt: "Jul 1, 2026, 10:00 AM (Asia/Calcutta)"
  submissionDeadline: "Jul 6, 2026, 12:00 PM (Asia/Calcutta)"
  registrationDeadline: "Jul 1, 2026, 10:00 PM (Asia/Calcutta)"
  description: "This assignment is designed to take you from a curious spectator to a confident creator using the OpenAI API. Whether you are looking to get your feet wet or push the boundaries of what AI can do, this event focuses on practical execution. No advanced coding experience? No problem. We have built this experience to meet you exactly where you are. Each section has a problem statement. Read carefully, ideate the project architecture and solve it. You can use the Co-Pilot in the project playground and the skills which are created to help you ideate and build better. > **Engineering Beats Flash:** You will be graded on the exact same rubric. We reward robust API design over surface-level flash. Choosing the right model, handling errors gracefully, and optimizing for cost will always beat a \"clever\" idea held together with tape. Join us to build something real, engineered with care. Let’s get to work!"
sponsors[3]:
  - slug: section-a
    name: Section A
    tier: null
    prizePoolUsd: 0
    tagline: null
    website: null
    description: "## Talking to the Model Mastering prompt engineering to extract highly useful, predictable text responses. * **Core Skill:** Sending input to the Responses API, shaping behavior with a system prompt, and keeping a conversation going. --- ### The Socratic Tutor * **Goal:** A multi-turn tutor that helps a student reach an answer without ever stating it directly — it asks guiding questions, adapts to wrong answers, and only confirms once the student gets there. * **Build:** A chat loop that keeps conversation history, with a system prompt enforcing the \"never give the answer\" rule and a graceful path for when the student is totally stuck. * **OpenAI Basics:** Maintaining message history across …"
    requirements: []
    bounties: []
    judgingCriteria[5]{name,weightPercent,description}:
      Effective use of the OpenAI API,30,"Right model chosen in code for the job (cheap default like gpt-5.4-mini; bigger model only where the task needs it); correct use of the Responses API, structured outputs (json_schema strict), and tool/function calling where the problem calls for them…"
      Functionality & correctness,25,The program runs end-to-end and produces the output the chosen problem asks for. The required example inputs/outputs are present in the repo and reproducible by re-running.
      Code quality & structure,20,"Readable, sensibly organized, meaningful names, no dead/commented-out code, no copy-paste duplication. Logic split into functions, not one long script. Reasonable comments where intent isn't obvious."
      Robustness & error handling,15,"Handles bad/empty input and API failures in code (try/except around calls, timeout/retry or a graceful message), validates structured output before using it, and doesn't crash on obvious edge cases."
      Safety & key hygiene,10,"API key read from an environment variable (never hard-coded or committed); .gitignore excludes secrets; any user-facing risk is guarded in code (input checks, refusal path, \"simulation only\" framing where relevant)."
  - slug: section-b
    name: Section B
    tier: null
    prizePoolUsd: 0
    tagline: null
    website: null
    description: "## Making the Model Reliable Forcing clean, structured JSON output and enabling the model to interact with real-world tools. * **Core Skill:** Sending input to the Responses API, shaping behavior with a system prompt, and keeping a conversation going. --- ### The Tool-Using Mini-Agent. * **Goal:** A small assistant that can answer questions which require doing something — e.g. \"what's 17% of 4,820?\" (calls a calculator) or \"is it raining in Nagpur?\" (calls a weather function you stub). * **Build:** Define 1–2 functions, let the model decide when to call them, run the function, feed the result back, and return a final answer. Handle the case where no tool is needed. * **OpenAI Basics:** Funct…"
    requirements: []
    bounties: []
    judgingCriteria[5]{name,weightPercent,description}:
      Effective use of the OpenAI API,30,"Right model chosen in code for the job (cheap default like gpt-5.4-mini; bigger model only where the task needs it); correct use of the Responses API, structured outputs (json_schema strict), and tool/function calling where the problem calls for them…"
      Functionality & correctness,25,The program runs end-to-end and produces the output the chosen problem asks for. The required example inputs/outputs are present in the repo and reproducible by re-running.
      Code quality & structure,20,"Readable, sensibly organized, meaningful names, no dead/commented-out code, no copy-paste duplication. Logic split into functions, not one long script. Reasonable comments where intent isn't obvious."
      Robustness & error handling,15,"Handles bad/empty input and API failures in code (try/except around calls, timeout/retry or a graceful message), validates structured output before using it, and doesn't crash on obvious edge cases."
      Safety & key hygiene,10,"API key read from an environment variable (never hard-coded or committed); .gitignore excludes secrets; any user-facing risk is guarded in code (input checks, refusal path, \"simulation only\" framing where relevant)."
  - slug: section-c
    name: Section C
    tier: null
    prizePoolUsd: null
    tagline: null
    website: null
    description: "## Beyond Text (Multimodal) Expanding into the multimodal universe with image inputs, image generation, and optional voice features. * **Core Skill:** Sending an image to the model, and generating an image from a prompt. --- ### Sketch to Polished * **Goal:** Take a rough idea or a hand-drawn sketch and produce a polished generated image — e.g., a logo concept, a poster for RBU AI Week, or a cleaned-up version of a sketch. * **Build:** Use GPT Image 2 to generate (or edit) an image from a well-crafted prompt; bonus for first using vision to read a sketch, then generating an improved version (see → make). * **OpenAI Basics:** Image generation/editing, prompt design for images, optionally chai…"
    requirements: []
    bounties: []
    judgingCriteria[5]{name,weightPercent,description}:
      Effective use of the OpenAI API,30,"Right model chosen in code for the job (cheap default like gpt-5.4-mini; bigger model only where the task needs it); correct use of the Responses API, structured outputs (json_schema strict), and tool/function calling where the problem calls for them…"
      Functionality & correctness,25,The program runs end-to-end and produces the output the chosen problem asks for. The required example inputs/outputs are present in the repo and reproducible by re-running.
      Code quality & structure,20,"Readable, sensibly organized, meaningful names, no dead/commented-out code, no copy-paste duplication. Logic split into functions, not one long script. Reasonable comments where intent isn't obvious."
      Robustness & error handling,15,"Handles bad/empty input and API failures in code (try/except around calls, timeout/retry or a graceful message), validates structured output before using it, and doesn't crash on obvious edge cases."
      Safety & key hygiene,10,"API key read from an environment variable (never hard-coded or committed); .gitignore excludes secrets; any user-facing risk is guarded in code (input checks, refusal path, \"simulation only\" framing where relevant)."
```

Mind `hackathon.stage` and the deadlines: they are snapshots from when the skill was generated and don't update — sanity-check timing before planning multi-day work.

## Credits

**1 credit = one ideator turn OR one knowledge-graph query.** Everything else (project/artifact commands, the evaluator prompt) is free. Spend credits on load-bearing questions, not browsing — and check the balance when planning a research burst:

```sh
loops credits --hackathonSlug rbu-ai-week
```

## Ideate with the AI mentor

The mentor knows this hackathon's live sponsors, bounties, and judging criteria. Conversations persist locally per hackathon (`~/.loops/sessions/`) and continue automatically — each call just sends one more message, so ask follow-ups freely instead of cramming everything into one prompt.

```sh
loops hackathon ideate --hackathonSlug rbu-ai-week -m "<your prompt>"
loops hackathon ideate --hackathonSlug rbu-ai-week -m "<follow-up>"               # same conversation
loops hackathon ideate --hackathonSlug rbu-ai-week --withProject -m "<prompt>"    # mentor sees the user's project
loops hackathon ideate --hackathonSlug rbu-ai-week --new -m "<fresh start>"       # discard the session first
loops hackathon session --hackathonSlug rbu-ai-week            # show the stored conversation (--clear to delete)
```

Use `--withProject` once a project exists — feedback grounded in what's actually built beats generic advice.

## Sponsor knowledge graphs (graph-RAG)

Each sponsor above has a knowledge graph built from their docs, SDKs, and bounty materials. A query returns a **cited evidence block** (entities, relationships, chunks, sources) — read the evidence and compose the answer yourself, citing it. This is how you avoid hallucinating sponsor APIs. 1 credit per query. One ready command per sponsor:

```sh
# Section A
loops knowledge query --hackathonSlug rbu-ai-week -s section-a -q "<your question about Section A>"

# Section B
loops knowledge query --hackathonSlug rbu-ai-week -s section-b -q "<your question about Section B>"

# Section C
loops knowledge query --hackathonSlug rbu-ai-week -s section-c -q "<your question about Section C>"
```

## Manage the project

A project IS the submission, the user has at most one here, and the platform resolves it from the session — no ids, no listings.

```sh
loops project get --hackathonSlug rbu-ai-week       # current state (exists=false if none yet)
loops project create --hackathonSlug rbu-ai-week --name "<name>" --repoUrl <url> --tagline "<one-liner>"
loops project update --hackathonSlug rbu-ai-week --description "<new description>"
```

**Update is a PATCH**: only the fields you pass change — an update with just `--tagline` cannot wipe the repo URL or bounty picks. Available fields: `--name`, `--tagline`, `--pitch`, `--description`, `--repoUrl`, `--demoUrl`, `--videoUrl`, `--bountyIds <id> --bountyIds <id>`.

## Ideation artifacts (scratchpad)

Persist ideas, problems, and tech-stack notes against this hackathon — they appear in the user's web playground too, so save anything worth keeping rather than letting it die in the conversation. Kinds: `idea`, `problem`, `tech-stack`, `note`.

```sh
loops artifact list --hackathonSlug rbu-ai-week
loops artifact save --hackathonSlug rbu-ai-week --name "<title>" --kind idea --body "<markdown body>"
loops artifact update --hackathonSlug rbu-ai-week --id <artifactId> --body "<updated markdown>"
loops artifact remove --hackathonSlug rbu-ai-week --id <artifactId>
```

## Evaluate the project against a sponsor

Fetch a self-contained evaluator prompt for one sponsor (free; the user's project record is included automatically), then **execute the prompt yourself inside the project repo** — it assumes the code access you have. It walks that sponsor's judging criteria and bounty requirements and produces alignment feedback: what's genuinely strong, what's missing, where to focus. Run it for every sponsor the project targets, well before the deadline.

```sh
loops evaluate --hackathonSlug rbu-ai-week -s <sponsorSlug>
```

Take sponsor slugs from the TOON data above. Report the feedback to the user, then reflect agreed improvements via `loops project update`.
