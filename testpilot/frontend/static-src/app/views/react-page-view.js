import ReactDOM from 'react-dom';
import PageView from './page-view';

export default PageView.extend({
  renderWithTemplate() {
    if (!this.el || !this.el.parentNode) {
      this.el = document.createElement('div');
      ReactDOM.render(this.renderReact(), this.el);
    }
    return this;
  }
});
