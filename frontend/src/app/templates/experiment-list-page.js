export default `
  <div>
      <header data-hook="header-view"></header>
      <div class="responsive-content-wrapper reverse-split-banner ">
        <div class="copter-wrapper fly-down">
          <div class="copter"></div>
        </div>
        <div class="intro-text">
          <h2 data-l10n-id="experimentListPageHeader" class="banner">Ready for Takeoff!</h2>
          <p data-l10n-id="experimentListPageSubHeader">Pick the features you want to try. <br> Check back soon for more experiments.</p>
        </div>
      </div>

      <div class="pinstripe responsive-content-wrapper"></div>
      <div class="responsive-content-wrapper">
        <div data-hook="experiment-list"></div>
      </div>
      <footer id="main-footer" class="responsive-content-wrapper">
        <div data-hook="footer-view"></div>
      </footer>
  </div>
`;
