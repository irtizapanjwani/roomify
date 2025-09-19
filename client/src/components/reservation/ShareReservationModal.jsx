import React, { useState, useEffect, useContext } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import { AuthContext } from '../../context/AuthContext';
import axios from '../../utils/axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShare, faCheckCircle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const ShareReservationModal = ({ show, onClose, reservationId }) => {
  const { user } = useContext(AuthContext);
  const [connections, setConnections] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [sharedData, setSharedData] = useState(null);
  const [existingShares, setExistingShares] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch connections
        const connectionsResponse = await axios.get('/api/connections/my-connections');
        const acceptedConnections = connectionsResponse.data
          .filter(conn => conn.status === 'accepted')
          .map(conn => {
            const connectedUser = conn.user1._id === user._id ? conn.user2 : conn.user1;
            return {
              _id: connectedUser._id,
              username: connectedUser.username,
              email: connectedUser.email
            };
          });
        
        // Fetch existing shares for this reservation
        const sharesResponse = await axios.get(`/api/shared-reservations?reservationId=${reservationId}`);
        const existingParticipants = sharesResponse.data.data?.participants?.map(p => p.userId) || [];
        setExistingShares(existingParticipants);
        
        // Filter out users who are already shared with
        const availableConnections = acceptedConnections.filter(
          conn => !existingParticipants.includes(conn._id)
        );
        
        setConnections(availableConnections);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || "Failed to fetch connections");
      } finally {
        setLoading(false);
      }
    };

    if (show) {
      setSuccess(false);
      setSharedData(null);
      setError(null);
      setSelectedParticipants([]);
      fetchData();
    }
  }, [show, user._id, reservationId]);

  const handleShare = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post('/api/shared-reservations/share', {
        reservationId,
        participants: selectedParticipants
      });
      
      console.log('Share response:', response.data);
      
      if (response.data.success) {
        // Update the original reservation's payment status to pending
        await axios.put(`/api/reservations/${reservationId}`, {
          paymentStatus: "pending",
          status: "Pending"
        });
        
        setSuccess(true);
        setSharedData(response.data.data);
        setTimeout(() => {
          setSelectedParticipants([]);
          onClose();
          setSuccess(false);
          setSharedData(null);
        }, 2000);
      } else {
        setError(response.data.message || "Failed to share reservation");
      }
    } catch (err) {
      console.error('Share error:', err);
      if (err.response?.data?.message?.includes('already shared')) {
        setError(
          <span>
            This reservation has already been shared with some users. 
            <Link to="/connections" className="ms-2 text-primary">
              View shared reservations
            </Link>
          </span>
        );
      } else {
        setError(err.response?.data?.message || "Failed to share reservation");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setSharedData(null);
    setError(null);
    setSelectedParticipants([]);
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Share Reservation</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert variant="success" className="mb-3">
            <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
            Reservation shared successfully! The selected friends will be notified.
            {sharedData && (
              <div className="mt-2">
                <small>
                  Amount per person: ${sharedData.amountPerUser.toFixed(2)}
                </small>
              </div>
            )}
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-3">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <div className="mt-2">{success ? 'Completing share...' : 'Loading connections...'}</div>
          </div>
        ) : connections.length === 0 ? (
          <Alert variant="info">
            {existingShares.length > 0 ? (
              <>
                <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                This reservation has already been shared with all your connections.
                <Link to="/connections" className="d-block mt-2">
                  View shared reservations
                </Link>
              </>
            ) : (
              'No connections found. Add friends to share reservations!'
            )}
          </Alert>
        ) : (
          <div className="connections-list">
            {connections.map(connection => (
              <div key={connection._id} className="connection-item d-flex align-items-center mb-2 p-2 border rounded">
                <input
                  type="checkbox"
                  className="me-3"
                  checked={selectedParticipants.includes(connection._id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedParticipants([...selectedParticipants, connection._id]);
                    } else {
                      setSelectedParticipants(
                        selectedParticipants.filter(id => id !== connection._id)
                      );
                    }
                  }}
                />
                <div>
                  <div className="fw-bold">{connection.username}</div>
                  <div className="text-muted small">{connection.email}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleShare} 
          disabled={loading || selectedParticipants.length === 0}
        >
          <FontAwesomeIcon icon={faShare} className="me-1" />
          {loading ? 'Sharing...' : 'Share'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ShareReservationModal;
