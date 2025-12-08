# Is it worth the time?

A quick visualisation for how much to spend on something that saves you time. For example, saving 5 minutes daily works out to be over 1 hour per month, and is worth up to \$87/month on a \$100k salary.

[isitworththetime.com](https://isitworththetime.com) is based on the much loved [xkcd #1205: Is It Worth the Time?](https://xkcd.com/1205/)

[![Screenshot](https://github.com/hoxxep/isitworththetime/blob/master/public/screenshot.png)](https://isitworththetime.com)

## How It Works

Every task you automate has a break-even point—the maximum you should spend before the cost exceeds the savings. This calculator finds that point.

### The Formula

The value of automating a task is:

$$\text{Value} = \frac{\text{Salary}}{2000} \times \text{Frequency} \times \text{Time Saved}$$

Where $\frac{\text{Salary}}{2000}$ gives your hourly rate based on a standard work year.

### Assumptions

| Parameter            | Value | Rationale                     |
|:---------------------|:------|:------------------------------|
| Work days/year       | 250   | 5 days/week, ~2 weeks holiday |
| Daily working hours  | 8     | Standard workday              |
| Yearly working hours | 2,000 | How we compute hourly rate    |

### Example

Earning **$100k/year** and saving **5 minutes daily**:

$$\frac{\$100{,}000}{2000} \times 250 \times \frac{5}{60} = \$1{,}042$$

You could spend up to **\$1,042/year** (or ~\$87/month) on a tool that saves you 5 minutes every workday.

## Dev Commands

| Command            | Action                                       |
|:-------------------|:---------------------------------------------|
| `pnpm install`     | Installs dependencies                        |
| `pnpm run dev`     | Starts local dev server at `localhost:4321`  |
| `pnpm run build`   | Build your production site to `./dist/`      |
| `pnpm run preview` | Preview your build locally, before deploying |
