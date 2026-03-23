# rubric and thresholds (v1, balanced default)

This rubric is used in two places:
1. qualifying opportunities
2. matching opportunities to intervention options

Default mode is **balanced**: value and speed matter, while risk/control are hard constraints.

## scoring scale (1-5)
- **1** = very weak / high concern
- **2** = weak / notable concern
- **3** = acceptable / workable
- **4** = strong
- **5** = very strong

## A) opportunity qualification rubric

## criteria
1. business impact
2. frequency/repetition
3. baseline measurability
4. data readiness
5. boundary clarity
6. pilotability (2-4 week slice)

## weighted score (balanced)
- business impact: 25%
- frequency/repetition: 15%
- baseline measurability: 15%
- data readiness: 15%
- boundary clarity: 15%
- pilotability: 15%

## gates (must pass)
- boundary clarity >= 3
- baseline measurability >= 3

## decision bands
- **4.0-5.0**: proceed
- **3.0-3.9**: proceed with conditions
- **<3.0**: defer

## B) option matching rubric

Score each option (no-AI, automation, ML, LLM, hybrid) on:
1. expected value
2. implementation effort (inverse scored: lower effort = higher score)
3. risk exposure (inverse scored: lower risk = higher score)
4. control confidence
5. time-to-pilot

## weighted score (balanced)
- expected value: 30%
- implementation effort: 20%
- risk exposure: 20%
- control confidence: 20%
- time-to-pilot: 10%

## gates (must pass)
- control confidence >= 3
- risk exposure >= 3

## decision rule
- Select highest scoring option that passes gates.
- Document one deferred alternative and trigger to revisit.

## C) outcome matrix thresholds

Track deltas across:
- time
- cost
- quality
- risk
- adoption friction
- control confidence

## pass / watch / fail logic
- **pass**:
  - improvement in >=3 dimensions
  - no decline in risk or control confidence
- **watch**:
  - mixed results OR one decline in non-critical dimension
- **fail**:
  - decline in risk or control confidence, or major quality degradation

## principle
A pilot is not a success if it is faster but less controllable.
