// const axios = require("axios");
// const fs = require("fs");

// const getData = async (matchId) => {
//   const response = await axios.get(
//     `https://www.cricbuzz.com/api/cricket-match/${matchId}/full-commentary/0`
//   );

//   // Two API calls
//   const [inn1Response, inn2Response] = await Promise.all([
//     axios.get(
//       `https://www.cricbuzz.com/api/cricket-match/${matchId}/full-commentary/1`
//     ),
//     axios.get(
//       `https://www.cricbuzz.com/api/cricket-match/${matchId}/full-commentary/2`
//     ),
//   ]);

//   if (!inn1Response || !inn2Response) {
//     console.error(`No Data found`);
//   }

//   const inn1Comm = inn1Response.data.commentary[0].commentaryList.map((cm) => {
//     return {
//       timestamp: cm.timestamp,
//       dateInGMT: new Date(cm.timestamp),
//       dateInIST: new Date(cm.timestamp).toLocaleString("en-IN", {
//         timeZone: "Asia/Kolkata",
//       }),
//       commText: cm.commText,
//       ballNbr: cm.ballNbr,
//       batTeamName: cm.batTeamName,
//       overNumber: cm.overNumber,
//       event: cm.event,
//       overSeparator_score: cm?.overSeparator?.score,
//       overSeparator_wickets: cm?.overSeparator?.wickets,
//       overSeparator_over_summary: cm?.overSeparator?.o_summary,
//       overSeparator_runs: cm?.overSeparator?.runs,
//     };
//   });

//   const inn2Comm = inn2Response.data.commentary[0].commentaryList.map((cm) => {
//     return {
//       timestamp: cm.timestamp,
//       dateInGMT: new Date(cm.timestamp),
//       dateInIST: new Date(cm.timestamp).toLocaleString("en-IN", {
//         timeZone: "Asia/Kolkata",
//       }),
//       commText: cm.commText,
//       ballNbr: cm.ballNbr,
//       batTeamName: cm.batTeamName,
//       overNumber: cm.overNumber,
//       event: cm.event,
//       overSeparator_score: cm?.overSeparator?.score,
//       overSeparator_wickets: cm?.overSeparator?.wickets,
//       overSeparator_over_summary: cm?.overSeparator?.o_summary,
//       overSeparator_runs: cm?.overSeparator?.runs,
//     };
//   });

//   const finalData = {
//     matchId: response.data.matchId,
//     team1: response.data.matchDetails.matchHeader.team1.name,
//     team2: response.data.matchDetails.matchHeader.team2.name,
//     matchType: response.data.matchDetails.matchHeader.matchType,
//     matchFormat: response.data.matchDetails.matchHeader.matchFormat,
//     matchStartTimestamp:
//       response.data.matchDetails.matchHeader.matchStartTimestamp,
//     matchCompleteTimestamp:
//       response.data.matchDetails.matchHeader.matchCompleteTimestamp,
//     tossResults: response.data.matchDetails.matchHeader.tossResults,
//     result: response.data.matchDetails.matchHeader.result,
//     playersOfTheMatch: response.data.matchDetails.matchHeader.playersOfTheMatch,
//     commentary: {
//       inning1: inn1Comm.sort((a, b) => a.timestamp - b.timestamp),
//       inning2: inn2Comm.sort((a, b) => a.timestamp - b.timestamp),
//     },
//   };

//   // Save to JSON file
//   fs.writeFileSync(
//     `${finalData.matchId}-${finalData.team1}-vs-${finalData.team2}-.json`,
//     JSON.stringify(finalData, 0, 2)
//   );

//   console.log(`Saved ${matchId}-inn1.csv and ${matchId}-inn2.csv`);
// };

// (async () => {
//   await getData(118619);
// })();

const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public")); // for serving frontend files

const getData = async (matchId) => {
  console.log(`looping for ${matchId}`);
  try {
    const response = await axios.get(
      `https://www.cricbuzz.com/api/cricket-match/${matchId}/full-commentary/0`
    );
    console.log(
      `https://www.cricbuzz.com/api/cricket-match/${matchId}/full-commentary/0`
    );

    // Two API calls
    const [inn1Response, inn2Response] = await Promise.all([
      axios.get(
        `https://www.cricbuzz.com/api/cricket-match/${matchId}/full-commentary/1`
      ),
      axios.get(
        `https://www.cricbuzz.com/api/cricket-match/${matchId}/full-commentary/2`
      ),
    ]);

    const mapCommentary = (data) =>
      data.commentary[0].commentaryList.map((cm) => ({
        timestamp: cm.timestamp,
        dateInGMT: new Date(cm.timestamp),
        dateInIST: new Date(cm.timestamp).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        }),
        commText: cm.commText,
        ballNbr: cm.ballNbr,
        batTeamName: cm.batTeamName,
        overNumber: cm.overNumber,
        event: cm.event,
        overSeparator_score: cm?.overSeparator?.score,
        overSeparator_wickets: cm?.overSeparator?.wickets,
        overSeparator_over_summary: cm?.overSeparator?.o_summary,
        overSeparator_runs: cm?.overSeparator?.runs,
      }));

    const inn1Comm = inn1Response?.data ? mapCommentary(inn1Response.data) : [];
    const inn2Comm = inn2Response?.data ? mapCommentary(inn2Response.data) : [];

    const finalData = {
      matchId: response.data.matchId,
      team1: response.data.matchDetails.matchHeader.team1.name,
      team2: response.data.matchDetails.matchHeader.team2.name,
      matchType: response.data.matchDetails.matchHeader.matchType,
      matchFormat: response.data.matchDetails.matchHeader.matchFormat,
      matchStartTimestamp:
        response.data.matchDetails.matchHeader.matchStartTimestamp,
      matchCompleteTimestamp:
        response.data.matchDetails.matchHeader.matchCompleteTimestamp,
      tossResults: response.data.matchDetails.matchHeader.tossResults,
      result: response.data.matchDetails.matchHeader.result,
      playersOfTheMatch:
        response.data.matchDetails.matchHeader.playersOfTheMatch,
      commentary: {
        inning1: inn1Comm.sort((a, b) => a.timestamp - b.timestamp),
        inning2: inn2Comm.sort((a, b) => a.timestamp - b.timestamp),
      },
    };

    // Save to JSON
    const fileName = `${finalData.matchId}-${finalData.team1}-vs-${finalData.team2}.json`;
    fs.writeFileSync(
      path.join(__dirname, "public", "downloads", fileName),
      JSON.stringify(finalData, null, 2)
    );

    return fileName;
  } catch (err) {
    console.error(`❌ Failed for matchId ${matchId}:`, err.message);
    throw err; // bubble up so loop knows this ID failed
  }
};

// Route to handle form submission
app.post("/fetch", async (req, res) => {
  const matchIds = req.body.matchIds
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id);

  console.log(matchIds);

  const results = [];
  for (const id of matchIds) {
    try {
      console.log(id);
      const file = await getData(id);
      results.push({ id, file });
    } catch (err) {
      results.push({ id, error: err.message });
    }
  }

  console.log("results", results);

  res.send(`
    <h2>Processing Complete ✅</h2>
    <ul>
      ${results
        .map((r) =>
          r.error
            ? `<li>Match ${r.id}: ❌ ${r.error}</li>`
            : `<li>Match ${r.id}: <a href="/downloads/${r.file}" download>${r.file}</a></li>`
        )
        .join("")}
    </ul>
    <a href="/">⬅ Back</a>
  `);
});

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
