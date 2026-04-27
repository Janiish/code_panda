import { useParams } from 'react-router-dom';
import Trace from '../features/Trace';

export default function TracePage() {
  const { batchId } = useParams();

  return (
    <div className="page center-frame">
      <Trace initialBatchId={batchId || ''} />
    </div>
  );
}