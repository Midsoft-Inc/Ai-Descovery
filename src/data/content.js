// All the text on the landing page lives here. Edit this file to change content — no JSX changes needed.

export const MAIL = "midsoftglobal@gmail.com";
export const FEE = "₹29";
export const PROGRAMME = "Global AI Discovery Programme 2026";

// Must match TOPICS / CATEGORIES in config.js (the server rejects anything else)
export const TOPICS = ["General question", "Registration help", "Become a mentor / speaker", "Partnership / sponsorship"];
export const CATEGORIES = ["Student", "Educator", "Professional", "Entrepreneur", "AI beginner", "Other"];

export const NAV_LINKS = [
  ["journey", "Programme"],
  ["mentors", "Mentors"],
  ["challenge", "AI Winter of Code"],
  ["register", "Register"],
  ["about", "About"],
  ["contact", "Contact"],
];

export const STATS = [
  { n: 100, s: "+", label: "AI tools covered" },
  { n: 10000, s: "+", label: "Curated prompts" },
  { n: 10, s: "+", label: "Speakers & mentors" },
  { n: 10000, p: "₹", label: "Challenge prize pool" },
];

// Orbiting emoji in the hero art: [rotation time, inset, reverse?, [emoji, emoji]]
export const ORBS = [
  { t: "26s", inset: undefined, reverse: false, icons: ["🎨", "🤖"] },
  { t: "18s", inset: "12%", reverse: true, icons: ["💻", "📊"] },
  { t: "12s", inset: "26%", reverse: false, icons: ["⚡", "💡"] },
];

export const ROW1 = [["🧰", "100+ AI tools"], ["✍️", "10,000+ curated prompts"], ["💡", "1,000+ use cases"], ["🎤", "10+ speakers & mentors"], ["🎬", "Live demos"], ["🏆", "₹10,000 prize pool"]];
export const ROW2 = [["🤖", "AI agents"], ["🎨", "Image & video generation"], ["💻", "AI for coding"], ["📊", "Research & data"], ["⚙️", "Automation"], ["🚀", "Build your own AI"], ["📜", "Certificate of participation"]];

export const DAYS = [
  { theme: "Discover AI", title: "Understanding the AI world", text: "Generative AI, AI models, AI agents and AI search — oriented before you build anything.", tags: ["Generative AI", "AI Models", "AI Agents", "AI Search"], focus: ["30+ tools", "Live orientation session"] },
  { theme: "Create with AI", title: "AI for creativity & content", text: "Image, video, audio and writing tools, with live demos turning prompts into finished work.", tags: ["Image Gen", "Video Gen", "Audio & Music", "Writing & Design"], focus: ["30+ tools", "Hands-on creative activity"] },
  { theme: "Work with AI", title: "AI for real-world work", text: "Coding, research, business and automation — learning to pick the right tool for the task.", tags: ["Coding", "Research & Data", "Business", "Automation"], focus: ["40+ tools", "Tool-selection workshop"] },
  { theme: "Build your own AI", title: "Problem to working prototype", text: "Problem → Data → Model → Prompt/Logic → Application → Testing — every participant leaves with a build.", tags: ["Problem", "Data", "Model", "Prompt/Logic", "Application", "Testing"], focus: ["Hands-on", "1 creation each"] },
  { theme: "AI Winter of Code", title: "The global build challenge", text: "Submit your project, get judged on relevance, innovation and impact, and compete for the prize pool.", tags: ["Idea", "Build", "Test", "Submit", "Evaluation"], focus: ["₹10,000", "Top 3 win cash prizes"] },
];

// ---- Replace with your confirmed speaker list before launch ----
export const MENTORS = [
  { name: "Speaker Name 1", role: "AI Landscape", topic: "Where AI is heading in 2026 and beyond" },
  { name: "Speaker Name 2", role: "AI for Education", topic: "Using AI as a learning companion" },
  { name: "Speaker Name 3", role: "AI for Business", topic: "Practical AI for small teams" },
  { name: "Speaker Name 4", role: "AI for Coding", topic: "Shipping faster with AI pair programmers" },
  { name: "Speaker Name 5", role: "AI Automation & Agents", topic: "Designing autonomous workflows" },
  { name: "Speaker Name 6", role: "Building with AI", topic: "From prompt to working prototype" },
  { name: "Speaker Name 7", role: "Responsible AI", topic: "Using AI tools safely and honestly" },
  { name: "Speaker Name 8", role: "Future of AI", topic: "What’s next after this programme" },
];
// Set to false once the real speakers are in — hides the "placeholder" note under the mentor cards.
export const SHOW_MENTOR_NOTE = true;

export const PRIZES = [
  { medal: "🥇", amount: "₹5,000", pos: "First prize" },
  { medal: "🥈", amount: "₹3,000", pos: "Second prize" },
  { medal: "🥉", amount: "₹2,000", pos: "Third prize" },
];

export const REG_POINTS = [
  "5 live days, December 2026, fully online",
  "100+ AI tools, 10,000+ prompts, 1,000+ use cases",
  "Build your own AI solution on Day 4",
  "Certificate of Participation for eligible participants",
];

export const ABOUT_CARDS = [
  { ico: "🎯", title: "Our mission", text: "Make AI approachable. Five live days take you from understanding the AI landscape to building something of your own." },
  { ico: "🌍", title: "Who it’s for", text: "Students, educators, professionals, entrepreneurs and AI beginners from anywhere. No prior AI background needed." },
  { ico: "🛠️", title: "What you take away", text: "Working knowledge of 100+ AI tools, a library of prompts and use cases, and your own AI creation built on Day 4." },
];

export const FAQ = [
  ["Who can join?", "Students, educators, professionals, entrepreneurs and AI beginners. No prior AI background is needed."],
  ["How much does it cost?", "The full programme is a one-time ₹29."],
  ["When and where is it held?", "Five live days in December 2026, fully online. Registration is open from 1 Oct to 30 Nov 2026."],
  ["Will I get a certificate?", "Eligible participants receive a Certificate of Participation."],
];
