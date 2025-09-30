// Test script to generate 60 random votes for a quiz
// Usage: node test-generate-votes.js <quiz_id>

const quizId = process.argv[2];

if (!quizId) {
  console.error('Please provide a quiz ID');
  console.error('Usage: node test-generate-votes.js <quiz_id>');
  process.exit(1);
}

const firstNames = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'William', 'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia', 'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander', 'Abigail', 'Michael', 'Emily', 'Daniel', 'Elizabeth', 'Matthew', 'Sofia', 'Joseph', 'Avery', 'Jackson', 'Ella', 'David', 'Scarlett', 'Carter', 'Grace', 'Jayden', 'Chloe', 'Logan', 'Victoria', 'John', 'Riley', 'Owen', 'Aria', 'Dylan', 'Lily', 'Luke', 'Aubrey', 'Gabriel', 'Zoey', 'Anthony'];

const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'];

async function generateVotes() {
  try {
    // First, get the quiz data
    const quizRes = await fetch(`http://localhost:3000/api/quiz/${quizId}`);
    const quiz = await quizRes.json();

    if (!quiz.selected_applicants) {
      console.error('Quiz not found or has no applicants');
      process.exit(1);
    }

    console.log(`Generating 60 votes for quiz: ${quiz.name}`);
    console.log(`Quiz has ${quiz.selected_applicants.length} applicants`);

    // Generate 60 random submissions
    for (let i = 1; i <= 60; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const voterName = `${firstName} ${lastName}`;
      const voterEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@test.com`;

      // Generate random ratings for each applicant
      const ratings = {};
      quiz.selected_applicants.forEach(applicant => {
        // 80% chance to rate, 20% chance to abstain
        if (Math.random() > 0.2) {
          ratings[applicant.id] = Math.floor(Math.random() * 5) + 1; // 1-5
        } else {
          ratings[applicant.id] = null; // Abstain
        }
      });

      // Submit the vote
      const submitRes = await fetch(`http://localhost:3000/api/quiz/${quizId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voterName,
          voterEmail,
          ratings
        })
      });

      if (submitRes.ok) {
        console.log(`✓ Vote ${i}/60 submitted: ${voterName}`);
      } else {
        const error = await submitRes.json();
        console.log(`✗ Vote ${i}/60 failed: ${error.error}`);
      }

      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n✅ Done! Generated 60 test votes.');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

generateVotes();
