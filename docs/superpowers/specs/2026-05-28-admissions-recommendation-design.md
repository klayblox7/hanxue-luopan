# Admissions Recommendation Design

## Scope

Build a recommendation system for Chinese high school graduates or expected graduates who are preparing for first-year undergraduate admission to Korean universities.

The system should recommend schools for initial application review, not predict admission or promise acceptance.

## Target Applicant

- Chinese nationality applicant.
- High school graduate or expected graduate.
- Applying to a Korean four-year university as an undergraduate freshman.
- Main inputs: age, high school academic level, TOPIK level, intended major, preferred region, budget, school type preference, and language-track preference.

## Research Principle

Official sources come first. Each admission rule must record its source URL, source type, verification status, and updated date.

Information that cannot be confirmed from an official admissions page, international office page, or current admission guide must be marked as pending. The recommendation engine must not treat pending data as confirmed requirements.

## Admission Data Fields

Each school admission profile should include:

- `schoolSlug`
- `schoolNameCn`
- `sourceUrl`
- `sourceType`: `official`, `school`, `government`, `estimate`, or `pending`
- `guideYear`
- `admissionTrackName`
- `applicantScope`
- `nationalityRule`
- `educationRule`
- `topikMinimum`
- `topikAlternatives`
- `englishTrackAvailable`
- `englishScoreRequirement`
- `academicReview`
- `standardizedTests`
- `interviewRequired`
- `portfolioOrPracticalRequired`
- `conditionalAdmission`
- `financialProof`
- `majorExceptions`
- `verificationStatus`: `verified`, `partial`, or `pending`
- `updatedAt`
- `notes`

## Recommendation Model

Use deterministic scoring first, then AI-style explanation second.

The deterministic score should rank schools using:

- Major fit: 30
- Language fit: 20
- Academic fit: 20
- Budget fit: 10
- Region fit: 10
- School type preference: 5
- Source reliability: 5

The explanation layer may summarize why a school appears, what is missing, and what to verify. It must not invent admissions requirements.

## Result Categories

Recommendations should be labeled:

- `stable`: conditions fit relatively well.
- `match`: reasonable application candidate.
- `reach`: possible but requires stronger grades, language, or portfolio.
- `prepare_first`: applicant should improve TOPIK, documents, or portfolio before applying.
- `verify`: official source or department rule must be checked before recommending.

## Safety Copy

Every result page should show a Chinese disclaimer equivalent to:

`Recommendation results are only for initial school selection and do not guarantee admission. Always confirm with the school's latest admission guide.`

## First Research Batch

Start with representative schools where official admissions information is easier to verify:

- Seoul National University
- Yonsei University
- Korea University
- Sungkyunkwan University
- Hanyang University
- Kyung Hee University
- Chung-Ang University
- Hongik University
- Pusan National University
- Seoul National University of Science and Technology

This batch should validate the data model before expanding to all 50 schools.
