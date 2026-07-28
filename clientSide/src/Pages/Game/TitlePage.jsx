import LanguageCard from '../../Components/Cards/LanguageCard';
import { useSyllabus } from '../../Components/SyllabusContext';
import { Box, Typography } from '@mui/material';

function TitlePage() {
  const syllabus = useSyllabus();

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{
          fontSize: { xs: 22, md: 28 },
          fontWeight: 800,
          background: 'linear-gradient(90deg, #64ffda, #4fc3f7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 0.5,
        }}>
          Pick Your Language 🚀
        </Typography>
        <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.35)' }}>
          Choose a language to start your coding adventure
        </Typography>
      </Box>

      {/* Cards grid */}
      <Box sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        justifyContent: { xs: 'center', md: 'flex-start' },
      }}>
     
        {syllabus?.map((lan, i) => (
          <LanguageCard
            key={i}
            title={lan.lanName}
            syllabusId={lan.id}
          />
        ))}
      </Box>
    </Box>
  );
}

export default TitlePage;