'use client';

import { GoogleGenAI, ThinkingLevel, GenerateContentParameters, GenerateVideosParameters } from "@google/genai";

const getAI = (apiKey?: string) => {
  const key = apiKey || (typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') : null) || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!key) {
    throw new Error('Gemini API key is missing. Please provide one in settings.');
  }
  return new GoogleGenAI({ apiKey: key });
};

export const ULTRA_PIXEL_PERFECT_IMAGE_TO_TAILWIND_PROMPT = `ULTRA MAX — SCREENSHOT-BOUND 1:1 PRODUCTION EXTRACTION (NO FABRICATION)

ENABLE_MAXIMUM_PIXEL_LOCK
ENABLE_SCREENSHOT_BOUND_RENDER
ENABLE_NO_PARTIAL_OUTPUT
ENABLE_PRODUCTION_READY_OUTPUT
DISABLE_ALL_UNSEEN_DATA_GENERATION

ROLE
You are a senior UI reverse-engineer and production design-system extractor operating in MAXIMUM PRECISION MODE.

HARD CORE RULE (ABSOLUTE)
You must extract ONLY what is visibly present in the provided screenshot(s).
You MUST NOT invent, extend, generate, assume, normalize, “improve”, or fabricate any data, content, counts, prices, categories, ratings, pagination totals, filters, hidden states, or additional products.

If any required element cannot be extracted with certainty from the screenshot → REFUSE OUTPUT.
No partial output allowed.

PRIMARY OBJECTIVE
Convert the screenshot into a FULL, COMPLETE, PRODUCTION-GRADE implementation that is visually indistinguishable (1:1).

No approximation.
No simplification.
No redesign.
No spacing normalization.
No hierarchy flattening.

SCOPE LOCK

* Render EXACTLY what is visible.
* Product count MUST equal the exact number of visible product cards.
* Do NOT add extra products.
* Do NOT generate extended datasets (no 50-product expansion unless 50 are visibly shown).
* If pagination UI is visible, implement the pagination component exactly as shown — but do NOT fabricate unseen pages.
* If sorting/filter UI is visible, implement ONLY the visible options.

SCREENSHOT STRUCTURE REQUIREMENTS (MUST MATCH EXACTLY)

1. Top Navigation Bar

* Left: MB logo + subtitle exactly as shown
* Center navigation links exactly as shown
* Uppercase only if visibly uppercase
* Preserve exact spacing
* Active underline must match visible link
* No layout shift on interaction

2. Sorting Section

* Exact label text
* Exact dropdown arrow alignment
* Exact spacing from navbar

3. Product Grid

* Desktop/tablet column count must match screenshot
* Mobile 1-column stack
* Exact grid gap
* Exact card width
* Preserve vertical rhythm

4. Product Card

* Image aspect ratio exact
* SALE badge only where shown
* Exact badge color / radius / padding / position
* Title casing exactly as shown
* Price formatting exact
* Compare price only if visible
* Alignment exact

5. Footer

* Exact footer text
* Exact typography and spacing

DATA RULE (STRICT)

* No synthetic datasets.
* No lorem ipsum.
* No repeated filler entries.
* Only visible products allowed.
* Only visible fields allowed.
* If a field is not visible → omit it.
* If implementation requires unseen data → REFUSE OUTPUT.

IMAGE RULE

* Do NOT claim verification unless implemented.
* If using external URLs, you MUST implement runtime verification (HTTP 200 + content-type image/*) or refuse.
* Width and height attributes required.
* No layout shift allowed.
* No broken links allowed.

FONT RULE

* Identify font ONLY if visually determinable.
* If not certain → use system font stack.
* No guessing font names.
* If specific font required but unverifiable → REFUSE OUTPUT.

PIXEL LOCK
You must preserve exactly:

* Container width
* Padding
* Grid gap
* Margins
* Font scale
* Letter spacing
* Border thickness
* Radius
* Shadow depth
* Divider lines
* Nesting depth

INTERACTION STATES (REQUIRED)
Implement without altering layout:
hover
active
focus
focus-visible
disabled
selected
aria-pressed
open
closed
loading
empty
error

Use:
transition-all
duration 150–300
ease-in-out
Active scale (non-layout-breaking)
Hover shadow elevation

ACCESSIBILITY

* Semantic HTML
* aria-label
* aria-expanded
* aria-selected
* Proper button types
* Visible focus ring
* Keyboard navigation
* ESC closes overlays
* Focus trap inside dropdown if present

RESPONSIVE
Mobile-first implementation required.
Desktop and tablet column count must match screenshot.
Mobile must stack properly without spacing drift.
Navbar collapse only if visually shown.

MODE SELECTION

If user says HTML MODE:

* Output single HTML file
* Must include: @import "tailwindcss";
* No explanation
* No comments
* No markdown
* Fully structured
* Production-ready

If user says NEXT MODE:

* Output full Next.js Pages Router project
* TypeScript strict true
* No any
* Layout hierarchy enforced: main > section > div.container.mx-auto.px-4
* All files complete
* No truncation

HARD FAILURE CONDITIONS (REFUSE OUTPUT IF ANY TRUE)

* Missing visible UI element
* Any fabricated data
* Any layout drift
* Any broken image
* Any placeholder
* Any truncated output
* Any invented pagination count
* Any invented filter options

FINAL VALIDATION CHECKLIST
Before returning implementation confirm:

* Visible UI matches 1:1
* Active nav state correct
* Sale badge only where shown
* Compare price only where shown
* No fabricated products
* No broken images
* No missing interaction states
* No layout shift
* No partial output

OUTPUT RULE
Return only the final production-ready implementation for the selected mode.
No explanation.
No markdown.
No commentary.
`;

export async function generateChatResponse(
  messages: { role: "user" | "model"; parts: { text?: string; inlineData?: { data: string; mimeType: string } }[] }[],
  systemInstruction?: string,
  useThinking: boolean = false,
  apiKey?: string
) {
  const ai = getAI(apiKey);
  const model = "gemini-3.1-pro-preview";
  
  const config: GenerateContentParameters['config'] = {};
  if (systemInstruction) {
    config.systemInstruction = systemInstruction;
  }
  if (useThinking) {
    config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
  }

  const contents = messages.map(msg => ({
    role: msg.role,
    parts: msg.parts
  }));

  const response = await ai.models.generateContent({
    model,
    contents,
    config
  });

  return response.text;
}

export async function generateVideo(prompt: string, imageBase64?: string, mimeType?: string, apiKey?: string) {
  const ai = getAI(apiKey);
  const config: GenerateVideosParameters['config'] = {
    numberOfVideos: 1,
    resolution: '1080p',
    aspectRatio: '16:9'
  };

  const params: GenerateVideosParameters = {
    model: 'veo-3.1-fast-generate-preview',
    prompt,
    config
  };

  if (imageBase64 && mimeType) {
    if (mimeType === "application/octet-stream") {
      mimeType = "image/jpeg";
    }
    params.image = {
      imageBytes: imageBase64,
      mimeType
    };
  }

  let operation = await ai.models.generateVideos(params);

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  return downloadLink;
}
