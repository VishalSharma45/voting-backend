const express = require("express");
const Candidate = require("../models/Candidate");
const router = express.Router();
const { jwtAuthMiddleware } = require('../jwt');
const User = require("../models/User");

const checkAdminRole = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (user.role === 'admin') {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
}

router.post("/", jwtAuthMiddleware, async (req, res) => {
    try {
        if (! await checkAdminRole(req.user.id)) {
            return res.status(403).json({ message: "user does not have permission" });
        }

        let newCandidate = new Candidate(req.body);

        // Save the new candidate to the database
        let response = await newCandidate.save();
        res.status(200).json({ response: response });
    } catch (error) {
        res.status(500).json(error);
    }
});

router.put("/:candidateID", jwtAuthMiddleware, async (req, res) => {
    try {
        if (! await checkAdminRole(req.user.id)) {
            return res.status(404).json({ message: "user does not have permission" });
        }
        let candidateID = req.params.candidateID;
        const updatedCandidateData = req.body;

        let response = await Candidate.findByIdAndUpdate(candidateID, updatedCandidateData, {
            new: true, // Return the updated document
            runValidators: true, // Run mongoose validation
        });

        if (!response) {
            return res.status(403).json({ error: "Candidate not found" });
        }
        console.log('Candidate data updated');
        res.status(200).json(response);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Internal server error" });
    }
});

router.delete("/:candidateID", jwtAuthMiddleware, async (req, res) => {
    try {
        if (! await checkAdminRole(req.user.id)) {
            return res.status(403).json({ message: "user does not have permission" });
        }
        let candidateID = req.params.candidateID;

        let response = await Candidate.findByIdAndDelete(candidateID);

        if (!response) {
            return res.status(404).json({ error: "Candidate not found" });
        }
        console.log('Candidate deleted');
        res.status(200).json(response);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Internal server error" });
    }
});

// Start voting
router.post('/vote/:candidateID', jwtAuthMiddleware, async (req, res) => {
    // no admin can vote
    // user can only vote once

    const candidateID = req.params.candidateID;
    const userId = req.user.id;

    try {
        // Find the Candidate document with the specific candidateID
        const candidate = await Candidate.findById(candidateID);
        if (!candidate) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.isVoted) {
            return res.status(400).json({ message: 'You have already voted' });
        }
        if (user.role === 'admin') {
            return res.status(403).json({ message: 'admin is not alllowed' });
        }

        // Update the candidate document to record the vote
        candidate.votes.push({ user: userId });
        candidate.voteCount++;
        await candidate.save();

        // Update the user document
        user.isVoted = true;
        await user.save();

        res.status(200).json({ message: 'Voted recorder successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get('/vote/count', async (req, res) => {
    try {
        // Find all candidates and sort them by voteCount in descending order
        const candidate = await Candidate.find().sort({ voteCount: 'desc' });

        // Map the candidates to only return their name and voteCount
        const voteRecord = candidate.map((data) => {
            return {
                party: data.party,
                count: data.voteCount,
            }
        });

        return res.status(200).json(voteRecord);

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get('/candidate', async (req, res) => {
    try {
        const candidates = await Candidate.find();

        console.log(candidates);

        const candidateList = candidates.map((data) => {
            return {
                candidateName: data.name,
                party: data.party,
            }
        });
        res.status(200).json(candidateList);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
module.exports = router;