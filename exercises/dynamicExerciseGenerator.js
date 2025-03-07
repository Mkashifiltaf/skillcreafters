const UserProfile = require('./models/userProfile');
const ExerciseTemplates = require('./exercises/templates'); // Assuming you have templates defined

async function generatePersonalizedExercises(userId) {
    // Fetch user profile
    const userProfile = await UserProfile.findOne({ userId });
    if (!userProfile) {
        throw new Error('User profile not found');
    }

    const { learningStyle, currentSkillLevel, interests } = userProfile;
    let exercises = [];

    // Generate exercises based on learning style
    if (learningStyle === 'visual') {
        exercises = ExerciseTemplates.visualExercises;
    } else if (learningStyle === 'auditory') {
        exercises = ExerciseTemplates.auditoryExercises;
    } else if (learningStyle === 'reading') {
        exercises = ExerciseTemplates.readingExercises;
    } else if (learningStyle === 'kinesthetic') {
        exercises = ExerciseTemplates.kinestheticExercises;
    }

    // Filter exercises by skill level
    exercises = exercises.filter(exercise => exercise.difficulty === currentSkillLevel);

    // Further filter exercises based on interests
    exercises = exercises.filter(exercise => interests.some(interest => exercise.topics.includes(interest)));

    return exercises;
}

module.exports = generatePersonalizedExercises;
