import type { SampleBrief } from "./types";

export const SAMPLE_BRIEFS: readonly SampleBrief[] = [
  {
    id: "hydration",
    title: "Summer drink launch",
    text: "We're launching a new electrolyte drink this summer. Six weeks in Hyderabad and Chennai, ₹25 lakh. We want new buyers to try it. Our main line is: “Beat the heat. Guaranteed to cure dehydration in minutes.”",
    fields: {
      category: "fmcg_food",
      productClass: "fmcg",
      objective: "trial",
      cities: ["hyderabad", "chennai"],
      budgetINR: 2_500_000,
      weeks: 6,
      creativeLines: ["Beat the heat. Guaranteed to cure dehydration in minutes."],
      conditionTargeting: { asked: false, note: null },
      summary:
        "A new electrolyte drink wants trial in Hyderabad and Chennai over six summer weeks.",
    },
    review: {
      verdict: "revise",
      issues: [
        {
          quote: "Guaranteed to cure dehydration",
          rule: "cure_claim",
          problem: "Presents a drink as a cure for a medical condition.",
          rewrite: "Helps you rehydrate on hot days.",
        },
        {
          quote: "in minutes",
          rule: "guarantee",
          problem: "Promises a certain, instant health result.",
          rewrite: "Drop the time promise.",
        },
      ],
    },
  },
  {
    id: "glucometer",
    title: "Glucometer, three metros",
    text: "Glucometer brand. ₹40 lakh over eight weeks in Bengaluru, Mumbai and Delhi. We want to reach diabetics, ideally people who buy insulin on Apollo. Line: “India's most accurate glucometer.”",
    fields: {
      category: "devices",
      productClass: "device",
      objective: "sales",
      cities: ["bengaluru", "mumbai", "delhi_ncr"],
      budgetINR: 4_000_000,
      weeks: 8,
      creativeLines: ["India's most accurate glucometer."],
      conditionTargeting: {
        asked: true,
        note: "Picking people by what they are prescribed is refused. The plan reaches the diabetes-care shelf, store counters and order screens instead, which every shopper sees.",
      },
      summary: "A glucometer brand wants sales in Bengaluru, Mumbai and Delhi over eight weeks.",
    },
    review: {
      verdict: "revise",
      issues: [
        {
          quote: "India's most accurate glucometer",
          rule: "unsupported_superlative",
          problem: "Claims to be the most accurate without proof.",
          rewrite: "Clear readings in seconds. Ask at the counter.",
        },
      ],
    },
  },
  {
    id: "insurer",
    title: "Health insurer, monsoon",
    text: "Health insurer, monsoon campaign in the big metros, ₹15 lakh for four weeks. We want people to know about our OPD cover. Line: “Cover for every doctor visit this monsoon.”",
    fields: {
      category: "insurance",
      productClass: "service",
      objective: "awareness",
      cities: ["bengaluru", "mumbai", "delhi_ncr", "chennai", "hyderabad", "kolkata"],
      budgetINR: 1_500_000,
      weeks: 4,
      creativeLines: ["Cover for every doctor visit this monsoon."],
      conditionTargeting: { asked: false, note: null },
      summary:
        "A health insurer wants awareness of its OPD cover in six metros over four monsoon weeks.",
    },
    review: { verdict: "ok", issues: [] },
  },
  {
    id: "antibiotic",
    title: "Prescription antibiotic",
    text: "A prescription antibiotic brand wants ₹10 lakh over four weeks across all cities to grow sales.",
    fields: {
      category: "otc",
      productClass: "rx",
      objective: "sales",
      cities: [
        "hyderabad",
        "chennai",
        "bengaluru",
        "kolkata",
        "delhi_ncr",
        "mumbai",
        "pune",
        "ahmedabad",
      ],
      budgetINR: 1_000_000,
      weeks: 4,
      creativeLines: [],
      conditionTargeting: { asked: false, note: null },
      summary: "A prescription antibiotic wants sales in every city over four weeks.",
    },
    review: null,
  },
];
