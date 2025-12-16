export default function JobCard({ job }) {
  return (
    <div style={{
      padding: 15,
      margin: "15px 0",
      background: "#f3f3f3",
      borderRadius: 6
    }}>
      <h3>Job #{job.id}</h3>
      <p>Status: {job.status}</p>
      <p>Strategy: {job.strategy}</p>
      {job.plaintext && <p>Plaintext: <b>{job.plaintext}</b></p>}
      <p>Tried: {job.tried}</p>
      <p>Duration: {job.duration?.toFixed(5)} sec</p>
    </div>
  );
}
