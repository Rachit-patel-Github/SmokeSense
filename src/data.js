export const organs = {
  lungs: {
    name: "Lungs",
    short: "Pulmonary system",
    color: "#64d8bf",
    icon: "lungs",
    healthy: "Airways clear mucus and particles; elastic air sacs exchange oxygen and carbon dioxide.",
    exposed: "Smoke contains particles and gases that irritate airways, impair cilia, and can reduce lung function over time.",
    details: [
      "Tar and toxic particles deposit throughout the airways.",
      "Smoke can damage cilia, the tiny structures that help clear mucus.",
      "Smoking increases the risk of COPD and lung cancer.",
      "Quitting helps reduce coughing and shortness of breath over time.",
    ],
  },
  heart: {
    name: "Heart",
    short: "Cardiovascular system",
    color: "#ff7485",
    icon: "heart",
    healthy: "A muscular pump moves oxygen-rich blood through the body at a rhythm matched to its needs.",
    exposed: "Nicotine and other smoke chemicals can raise heart rate and blood pressure and contribute to cardiovascular disease.",
    details: [
      "Nicotine can temporarily increase heart rate and blood pressure.",
      "Smoking is a major risk factor for coronary heart disease.",
      "Carbon monoxide reduces the oxygen carried by blood.",
      "Heart attack risk falls after quitting and continues to improve.",
    ],
  },
  brain: {
    name: "Brain",
    short: "Neurological system",
    color: "#9e9bff",
    icon: "brain",
    healthy: "A dense network of blood vessels supplies the brain with oxygen and nutrients.",
    exposed: "Nicotine changes reward pathways and can lead to dependence; smoking also raises stroke risk.",
    details: [
      "Nicotine is highly addictive and affects the brain's reward system.",
      "Smoking damages blood vessels and increases stroke risk.",
      "Quitting lowers cardiovascular risk over time.",
    ],
  },
  vessels: {
    name: "Blood vessels",
    short: "Circulatory system",
    color: "#79baff",
    icon: "vessels",
    healthy: "Flexible vessel walls allow blood to flow and deliver oxygen to tissues.",
    exposed: "Chemicals in tobacco smoke damage vessel lining and promote narrowing and clot formation.",
    details: [
      "Smoking can injure the lining of blood vessels.",
      "Reduced oxygen delivery and narrowed vessels affect circulation.",
      "Smoking contributes to atherosclerosis and peripheral artery disease.",
    ],
  },
  mouth: {
    name: "Mouth & throat",
    short: "Upper airway",
    color: "#ffc27d",
    icon: "mouth",
    healthy: "Healthy oral tissues support speech, swallowing, and the first stages of digestion.",
    exposed: "Tobacco use increases the risk of cancers of the mouth and throat and can worsen gum health.",
    details: [
      "Smoking increases oral and throat cancer risk.",
      "Tobacco can contribute to gum disease, tooth loss, and delayed healing.",
      "The risk of oral disease improves after quitting.",
    ],
  },
  liver: {
    name: "Liver",
    short: "Metabolic system",
    color: "#f4b65f",
    icon: "liver",
    healthy: "The liver processes nutrients and helps metabolize many substances, including components of tobacco smoke.",
    exposed: "Smoking is associated with some liver diseases and may worsen outcomes; it does not mean liver damage is inevitable.",
    details: [
      "The liver processes many chemicals absorbed into the body.",
      "Smoking is associated with liver cancer and can worsen some liver conditions.",
      "The relationship is complex and is not an individual diagnosis.",
    ],
  },
  stomach: {
    name: "Stomach",
    short: "Digestive system",
    color: "#f0a08a",
    icon: "stomach",
    healthy: "The stomach helps break down food and works with the rest of the digestive tract.",
    exposed: "Smoking is associated with digestive conditions and can affect how the body responds to stomach injury.",
    details: [
      "Smoking is associated with a higher risk of some digestive disorders.",
      "Tobacco use can make it harder for stomach ulcers to heal.",
      "These population-level associations do not determine an individual's outcome.",
    ],
  },
  kidneys: {
    name: "Kidneys",
    short: "Urinary system",
    color: "#d7868b",
    icon: "kidneys",
    healthy: "The kidneys filter waste from blood and help regulate fluid, electrolytes, and blood pressure.",
    exposed: "Smoking can affect blood vessels throughout the body and is associated with increased kidney cancer risk.",
    details: [
      "Smoking is associated with increased risk of renal cell cancer.",
      "Vascular effects of smoking can affect kidney circulation.",
      "The illustration does not measure kidney function or predict disease.",
    ],
  },
  trachea: {
    name: "Trachea",
    short: "Airway",
    color: "#85c9d0",
    icon: "trachea",
    healthy: "The trachea carries air to the lungs; its lining helps trap and clear inhaled particles.",
    exposed: "Smoke can irritate the airway lining and impair the cilia that help move mucus and particles out.",
    details: [
      "Smoke irritates the lining of the airways.",
      "Smoking can impair cilia that help clear mucus and inhaled particles.",
      "Airway appearance in this model is illustrative, not a measure of injury.",
    ],
  },
  skin: {
    name: "Skin",
    short: "Integumentary system",
    color: "#f2a6a1",
    icon: "skin",
    healthy: "Well-perfused skin receives oxygen and nutrients that support repair and healthy tissue.",
    exposed: "Smoking narrows blood vessels and reduces oxygen delivery, contributing to premature skin ageing and slower healing.",
    details: [
      "Reduced circulation can affect skin oxygen supply.",
      "Smoking is associated with premature wrinkles and skin ageing.",
      "Wounds may heal more slowly in people who smoke.",
    ],
  },
};

export const modelScores = [
  { model: "Prophet", rmse: 0.213, mae: 0.188, mape: 1.36, group: "Classical / automated" },
  { model: "Holt–Winters", rmse: 0.243, mae: 0.188, mape: 1.34, group: "Classical" },
  { model: "SARIMA", rmse: 0.250, mae: 0.189, mape: 1.34, group: "Classical" },
  { model: "ARIMA", rmse: 0.253, mae: 0.211, mape: 1.51, group: "Classical" },
  { model: "GRU", rmse: 0.388, mae: 0.373, mape: 2.80, group: "Deep learning" },
  { model: "XGBoost baseline", rmse: 0.404, mae: 0.366, mape: 2.70, group: "Machine learning" },
  { model: "Differenced VAR", rmse: 0.409, mae: 0.359, mape: 2.59, group: "Classical / multivariate" },
  { model: "XGBoost tuned", rmse: 0.696, mae: 0.621, mape: 4.69, group: "Machine learning" },
  { model: "AR(1)", rmse: 1.672, mae: 1.445, mape: 10.95, group: "Classical" },
  { model: "ARMA(1,1)", rmse: 1.733, mae: 1.458, mape: 11.08, group: "Classical" },
  { model: "MA(1)", rmse: 3.793, mae: 3.550, mape: 26.61, group: "Classical" },
  { model: "LSTM", rmse: 1.023, mae: 0.911, mape: 6.92, group: "Deep learning" },
];

export const holdout = {
  GRU: [
    { year: 2007, actual: 14.6185, predicted: 14.3811 },
    { year: 2008, actual: 13.6704, predicted: 13.9800 },
    { year: 2009, actual: 13.0907, predicted: 13.5861 },
    { year: 2010, actual: 12.7704, predicted: 13.2216 },
  ],
  LSTM: [
    { year: 2007, actual: 14.6185, predicted: 14.7916 },
    { year: 2008, actual: 13.6704, predicted: 14.5351 },
    { year: 2009, actual: 13.0907, predicted: 14.3109 },
    { year: 2010, actual: 12.7704, predicted: 14.1561 },
  ],
  "XGBoost baseline": [
    { year: 2007, actual: 14.6185, predicted: 14.0704 },
    { year: 2008, actual: 13.6704, predicted: 13.4944 },
    { year: 2009, actual: 13.0907, predicted: 12.8745 },
    { year: 2010, actual: 12.7704, predicted: 12.2456 },
  ],
};

export const quitMilestones = [
  { time: "20 minutes", label: "Heart rate begins to drop", body: "Heart rate and blood pressure begin to move toward normal levels.", icon: "pulse" },
  { time: "12 hours", label: "Carbon monoxide falls", body: "Carbon monoxide in the blood drops toward a normal level.", icon: "wind" },
  { time: "2–12 weeks", label: "Circulation improves", body: "Circulation and lung function can improve.", icon: "activity" },
  { time: "1 year", label: "Heart disease risk falls", body: "Coronary heart disease risk is about half that of someone who continues to smoke.", icon: "heart" },
  { time: "5 years", label: "Stroke risk decreases", body: "Stroke risk can decrease substantially, depending on smoking history.", icon: "brain" },
  { time: "10 years", label: "Lung cancer risk falls", body: "The risk of dying from lung cancer is about half that of a person who continues to smoke.", icon: "shield" },
];

export const prevalence = [
  { year: 1995, prevalence: 20.0137 },
  { year: 1996, prevalence: 19.6340 },
  { year: 1997, prevalence: 18.9556 },
  { year: 1998, prevalence: 18.4926 },
  { year: 1999, prevalence: 18.0611 },
  { year: 2000, prevalence: 17.5611 },
  { year: 2001, prevalence: 17.4054 },
  { year: 2002, prevalence: 18.0370 },
  { year: 2003, prevalence: 17.1714 },
  { year: 2004, prevalence: 15.6481 },
  { year: 2005, prevalence: 15.2291 },
  { year: 2006, prevalence: 14.7909 },
  { year: 2007, prevalence: 14.7429 },
  { year: 2008, prevalence: 13.7714 },
  { year: 2009, prevalence: 13.1464 },
  { year: 2010, prevalence: 12.8571 },
];

export const sources = [
  { label: "CDC — Benefits of Quitting", href: "https://www.cdc.gov/tobacco/about/benefits-of-quitting.html" },
  { label: "CDC — Health Effects of Cigarette Smoking", href: "https://www.cdc.gov/tobacco/about/cigarette-smoking.html" },
  { label: "National Cancer Institute — Harms of Cigarette Smoking", href: "https://www.cancer.gov/about-cancer/causes-prevention/risk/tobacco" },
];
