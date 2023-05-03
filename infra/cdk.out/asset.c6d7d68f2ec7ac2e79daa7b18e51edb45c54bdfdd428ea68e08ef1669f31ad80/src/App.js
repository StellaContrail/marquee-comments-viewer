import CommentPage from './pages/CommentPage';
import Grid from '@mui/material/Grid';

function App() {
  return (
    <Grid container spacing={0} direction="column" alignItems="center" justifyContent="center" style={{ minHeight: '100vh' }}>
      <Grid item xs={3}>
        <CommentPage />
      </Grid>   
    </Grid> 
  );
}

export default App;
