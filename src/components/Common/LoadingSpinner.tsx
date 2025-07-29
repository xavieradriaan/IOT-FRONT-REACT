import { Box, CircularProgress, Typography, Skeleton } from '@mui/material';

interface LoadingSpinnerProps {
  size?: number;
  message?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner = ({ 
  size = 40, 
  message = 'Cargando...', 
  fullScreen = false 
}: LoadingSpinnerProps) => {
  const content = (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={2}
    >
      <CircularProgress size={size} thickness={4} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        display="flex"
        alignItems="center"
        justifyContent="center"
        bgcolor="background.default"
        zIndex={9999}
      >
        {content}
      </Box>
    );
  }

  return content;
};

interface SkeletonCardProps {
  lines?: number;
  height?: number;
}

export const SkeletonCard = ({ lines = 3, height = 200 }: SkeletonCardProps) => (
  <Box sx={{ p: 2 }}>
    <Skeleton variant="rectangular" height={height} sx={{ mb: 2, borderRadius: 2 }} />
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton
        key={index}
        variant="text"
        height={20}
        width={index === lines - 1 ? '60%' : '100%'}
        sx={{ mb: 1 }}
      />
    ))}
  </Box>
);

export default LoadingSpinner;