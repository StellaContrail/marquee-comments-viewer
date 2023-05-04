import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import { useEffect, useState } from 'react';


function CommentPage() {
  const [comment, setComment] = useState("");
  const [BASEURL, setBASEURL] = useState("");

  useEffect(() => {
    fetch('config.json')
      .then((res) => res.json())
      .then((json) => json.API_BASE_URL)
      .then((url) => setBASEURL(url));
  });

  const handleSubmit = async () => {
    if (comment.trim() === "") {
      return;
    }

    const body = {
      "message": comment
    }

    try {
      console.log("sending the comment...");
      await window.fetch(BASEURL + "/comment", {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify(body)
      });
      console.log("done.");

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
