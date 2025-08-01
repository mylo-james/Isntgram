import React from 'react';

interface ModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onRequestClose?: () => void;
  [key: string]: any;
}

const Modal: React.FC<ModalProps> = ({
  children,
  isOpen,
  onRequestClose,
  ...props
}) => {
  if (!isOpen) return null;
  return (
    <div data-testid='modal' onClick={onRequestClose} {...props}>
      {children}
    </div>
  );
};

Modal.setAppElement = jest.fn();

export default Modal;
