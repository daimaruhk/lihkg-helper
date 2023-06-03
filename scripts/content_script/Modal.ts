import { html } from '../utils';

type ModalOptions = {
  title: string;
  message: string;
  action: () => void;
}

export class Modal {
  private static modalOpenEvent = 'app:on-modal-open';
  private static modalCloseEvent = 'app:on-modal-close';
  private static modalId = 'lihkg-helper-modal';

  public static init() {
    window.addEventListener(this.modalOpenEvent, (e: CustomEvent<ModalOptions>) => this.openModal(e.detail));
    window.addEventListener(this.modalCloseEvent, () => this.closeModal());
  };

  public static show(options: ModalOptions) {
    window.dispatchEvent(new CustomEvent(this.modalOpenEvent, { detail: options }));
  };

  public static close() {
    window.dispatchEvent(new CustomEvent(this.modalCloseEvent));
  };

  private static openModal(options: ModalOptions) {
    const { title, message, action } = options;
    const modal = html<HTMLDialogElement>`
      <dialog id=${this.modalId}>
        <div class="modal-header">
          <div class="modal-title">${title}</div>
          <button class="modal-btn-hover">
            <i class="i-close"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="modal-content">${message}</div>
          <div class="modal-btns">
            <button class="modal-btn modal-btn-hover modal-confirm-btn">確認</button>
            <button class="modal-btn modal-btn-hover modal-cancel-btn">取消</button>
          </div>
        </div>
      </dialog>
    `;
    const onClose = () => this.close();
    modal.querySelector('.modal-header button').addEventListener('click', onClose);
    modal.querySelector('.modal-cancel-btn').addEventListener('click', onClose);
    modal.querySelector('.modal-confirm-btn').addEventListener('click', action);
    document.body.appendChild(modal);
    modal.showModal();
  };

  private static closeModal() {
    const modal = document.querySelector<HTMLDialogElement>(`#${this.modalId}`);
    if (!modal) return;
    modal.close();
    modal.remove();
  };
}