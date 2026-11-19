export const SITE = {
  name: "LogitLab",
  url: "https://logitlab.vercel.app",
  githubUrl: "https://github.com/saidibnali19/logitlab",
  aboutHref: "#about",
  year: 2026,
  /** The one line that says what version 2 adds. Use it word for word wherever the page mentions version 2. */
  v2Line:
    "Planned for version 2: analysing your own CSV, and changing any choice LogitLab made.",
  /** Where the example CSV came from, so the footer and README can credit it. */
  dataSource: {
    name: "Kaggle",
    url: "https://www.kaggle.com/datasets/aasheesh200/framingham-heart-study-dataset",
  },
  author: {
    name: "Said Ali",
    title: "Statistics graduate, aspiring data analyst",
    email: "saidbidhachiali@gmail.com",
    githubProfile: "https://github.com/saidibnali19",
    photo: "/images/said-ali.webp",
  },
} as const;
