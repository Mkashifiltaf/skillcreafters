const logger = require('../utils/logger');
const { ObjectId } = require('mongodb');

class TournamentService {
    constructor(db) {
        this.db = db;
    }

    async createTournament(data) {
        const { name, description, startDate, endDate, maxTeams } = data;
        if (!name || !description || !startDate || !endDate || !maxTeams) {
            throw new Error('All fields are required to create a tournament.');
        }

        const tournament = await this.db.tournaments.create({
            name,
            description,
            startDate,
            endDate,
            maxTeams,
            teams: [],
            status: 'upcoming'
        });

        logger.info('Tournament created', { tournamentId: tournament._id });
        return tournament;
    }

    async registerTeam(tournamentId, teamData) {
        const tournament = await this.db.tournaments.findById(tournamentId);

        if (!tournament) {
            throw new Error('Tournament not found');
        }

        if (tournament.teams.length >= tournament.maxTeams) {
            throw new Error('Tournament is full');
        }

        if (!teamData || Object.keys(teamData).length === 0) {
            throw new Error('Team data is required to register a team.');
        }

        tournament.teams.push(teamData);
        await tournament.save();

        logger.info('Team registered for tournament', { tournamentId, team: teamData });
        return tournament;
    }

    async startTournament(tournamentId) {
        const tournament = await this.db.tournaments.findById(tournamentId);

        if (!tournament) {
            throw new Error('Tournament not found');
        }

        tournament.status = 'ongoing';
        await tournament.save();

        logger.info('Tournament started', { tournamentId });
        return tournament;
    }

    async endTournament(tournamentId) {
        const tournament = await this.db.tournaments.findById(tournamentId);

        if (!tournament) {
            throw new Error('Tournament not found');
        }

        tournament.status = 'completed';
        await tournament.save();

        logger.info('Tournament ended', { tournamentId });
        return tournament;
    }

    async scoreTournament(tournamentId, scores) {
        const tournament = await this.db.tournaments.findById(tournamentId);

        if (!tournament) {
            throw new Error('Tournament not found');
        }

        tournament.scores = scores;
        await tournament.save();

        logger.info('Scores updated for tournament', { tournamentId, scores });
        return tournament;
    }

    async createHackathon(data) {
        const { name, description, startDate, endDate, maxTeams, submissionDeadline } = data;

        const hackathon = await this.db.hackathons.create({
            name,
            description,
            startDate,
            endDate,
            maxTeams,
            submissionDeadline,
            teams: [],
            status: 'upcoming'
        });

        logger.info('Hackathon created', { hackathonId: hackathon._id });
        return hackathon;
    }

    async submitProject(hackathonId, teamData) {
        const hackathon = await this.db.hackathons.findById(hackathonId);

        if (!hackathon) {
            throw new Error('Hackathon not found');
        }

        if (new Date() > hackathon.submissionDeadline) {
            throw new Error('Submission deadline has passed');
        }

        hackathon.teams.push(teamData);
        await hackathon.save();

        logger.info('Project submitted for hackathon', { hackathonId, team: teamData });
        return hackathon;
    }

    async scoreHackathon(hackathonId, scores) {
        const hackathon = await this.db.hackathons.findById(hackathonId);

        if (!hackathon) {
            throw new Error('Hackathon not found');
        }

        hackathon.scores = scores;
        await hackathon.save();

        logger.info('Scores updated for hackathon', { hackathonId, scores });
        return hackathon;
    }

    async getHackathonLeaderboard(hackathonId) {
        const hackathon = await this.db.hackathons.findById(hackathonId);

        if (!hackathon) {
            throw new Error('Hackathon not found');
        }

        const leaderboard = hackathon.teams.sort((a, b) => b.score - a.score);
        return leaderboard;
    }
}

module.exports = TournamentService;
