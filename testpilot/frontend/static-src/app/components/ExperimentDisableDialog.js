import app from 'ampersand-app';
import React from 'react';

export default class ExperimentDisableDialog extends React.Component {
  render() {
    const {experiment} = this.props;
    return (
      <div className="modal-container">
        <div id="disabled-feedback-modal" className="modal feedback-modal modal-bounce-in">
          <h3 className="title"
              data-l10n-id="feedbackUninstallTitle"
              data-l10n-args={JSON.stringify({'title': experiment.title})}></h3>
          <div className="modal-content">
            <div className="copter-wrapper">
              <div className="copter"></div>
            </div>
            <p className="centered" data-l10n-id="feedbackUninstallCopy">
              Your participation in Firefox Test Pilot means a lot!
              Please check out our other experiments, and stay tuned for more to come!
            </p>
          </div>
          <div className="modal-actions">
            <a data-l10n-id="feedbackSubmitButton"
               onClick={(e) => this.submit(e)} href={experiment.buildSurveyURL('disable')}
               target="_blank" className="submit button default large quit">Take a quick survey</a>
            <a data-l10n-id="feedbackCancelButton" className="cancel"
               onClick={(e) => this.cancel(e)} href="">Close</a>
          </div>
        </div>
      </div>
    );
  }

  submit(e) {
    app.sendToGA('event', {
      eventCategory: 'ExperimentDetailsPage Interactions',
      eventAction: 'button click',
      eventLabel: 'exit survey disabled'
    });
    this.props.onSubmit && this.props.onSubmit(e);
  }

  cancel(e) {
    e.preventDefault();
    this.props.onCancel && this.props.onCancel(e);
  }
}
