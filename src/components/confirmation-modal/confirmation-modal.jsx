import Modal from "../shared/modal/modal";
import Button from "../shared/button/button";

const ConfirmModal = ({ show, message, onConfirm, onCancel }) => {
  return (
    <Modal
      show={show}
      onCancel={onCancel}
      header="Are you sure?"
      footer={
        <div
          style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}
        >
          <Button inverse onClick={onCancel}>
            Cancel
          </Button>
          <Button danger onClick={onConfirm}>
            Confirm
          </Button>
        </div>
      }
    >
      <p style={{ margin: 0, color: "var(--text-color)" }}>{message}</p>
    </Modal>
  );
};

export default ConfirmModal;
