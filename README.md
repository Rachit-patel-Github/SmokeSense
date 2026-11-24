# SmokeSense AI

SmokeSense AI is a local, educational dashboard that pairs an interactive 3D anatomy atlas with a smoking exposure simulator, organ-specific health information, cessation milestones, and evaluation results from a BRFSS time-series research project.

> **Educational use only.** This project is not a clinical diagnostic tool and does not give medical advice. Pack-years are a calculated exposure measure; cigarette count, age, and duration do not determine an individual's exact organ damage or disease risk. The anatomy visualization is illustrative, not medical imaging.

## Features

- Interactive 3D anatomy atlas with selectable organs, surface/X-ray/internal views, drag-to-rotate, scroll-to-zoom, pan, and exposure-responsive illustrative coloring.
- Smoking simulator for smoking status, cigarettes/day, years, frequency, and optional age; pack-years are calculated as `(cigarettes per day / 20) × years`.
- Organ-specific educational comparisons for lungs, heart, brain, blood vessels, mouth/throat, liver, and skin.
- Quitting timeline informed by CDC resources.
- BRFSS dashboard and model comparison sourced from the supplied notebook's evaluation outputs.
- CSV import for historical prevalence and supplied forecast series. The application does not synthesize future forecasts.
- Responsive navigation and charts, with switchable light and classic themes.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Run locally

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`). Create a production build with:

```powershell
npm run build
npm run preview
```

## Research data and forecasting

The notebook documents the CDC BRFSS four-level smoking data (1995–2010; 56 state and territory units), with **Smoke everyday** as the target. The interface includes the provided model evaluation results, and available four-year holdout predictions for GRU, LSTM, and the baseline XGBoost series. The notebook's extracted annual actual-mean outputs currently include 2007–2010; import the original CSV to explore the full historical series. It does not include fitted model files or make a future prediction.

To load the full historical series, import a CSV containing `Year` and `Smoke everyday` columns. To display model-supplied values, import a CSV containing `Year` and `Predicted` columns in the Forecasting page. Values are plotted as supplied; no forecasting or model training occurs in the browser.

The reported classical and advanced-model results were evaluated on slightly different state sets. Model scores are therefore descriptive of the project's specific holdouts, not directly interchangeable estimates of general performance. The source contains only 16 annual points for the aggregate series.

## 3D anatomy assets

The GLB assets in `public/models/` are adapted from the Z-Anatomy human anatomy meshes in the [Z-Anatomy Unity project](https://github.com/Z-Anatomy/Unity-app_Z-Anatomy), including body-region, visceral, cardiovascular, and nervous-system structures. The source project is licensed under [Creative Commons Attribution-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-sa/4.0/); these adapted anatomy assets are provided under the same license. Z-Anatomy credits the underlying BodyParts3D database (Database Center for Life Science, CC BY-SA 2.1 Japan). See the [upstream license and attribution](https://github.com/Z-Anatomy/Unity-app_Z-Anatomy/blob/PC-Version/LICENSE) and [model documentation](https://github.com/Z-Anatomy/Models-of-human-anatomy/blob/master/Readme.md).

The surface is an atlas mesh with a PBR skin material, not a photogrammetry scan or clinical image. Exposure-dependent organ colors are illustrative only and do not represent measured tissue damage or individual health risk.

## Health references

- [CDC — Benefits of Quitting](https://www.cdc.gov/tobacco/about/benefits-of-quitting.html)
- [CDC — Health Effects of Cigarette Smoking](https://www.cdc.gov/tobacco/about/cigarette-smoking.html)
- [National Cancer Institute — Harms of Cigarette Smoking](https://www.cancer.gov/about-cancer/causes-prevention/risk/tobacco)

The cessation timeline uses population-level estimates; timeframes and individual outcomes vary.
