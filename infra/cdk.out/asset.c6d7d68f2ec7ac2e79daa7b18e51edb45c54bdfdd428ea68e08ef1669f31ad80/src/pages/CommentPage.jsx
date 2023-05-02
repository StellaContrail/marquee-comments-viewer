import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import { useState } from 'react';

function CommentPage() {
  const [comment, setComment] = useState("");

  const handleSubmit = async () => {
    if (comment.trim() === "") {
      return;
    }

    const body = {
      "id": 1,
      "body": comment
    }

    try {
      await window.fetch("https://3avu3bh3b4.execute-api.ap-northeast-1.amazonaws.com/prod/comment/", {
        method: "POST",
        body: JSON.stringify(body)
      });

      setComment("");
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Grid container spacing={1} direction="column" alignItems="center" justifyContent="center" style={{ minHeight: '100vh', minWidth: '300px' }}>
      <Grid item>
        コメントを入力してください
      </Grid>
      <Grid item>
        <TextField name="body" variant="outlined" size="small" style={{ minWidth: '300px' }} value={comment || ''} onChange={(e) => setComment(e.target.value) } />
      </Grid>
      <Grid item>
        <Button variant="contained" onClick={handleSubmit}>投稿</Button>
      </Grid>
    </Grid>
  );
}

export default CommentPage;
