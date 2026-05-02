// @ts-nocheck
import { HeaderPage } from "../../pages/HeaderPage/HeaderPage";
import "../../scss/grid.scss";

export class TestGridPage extends HeaderPage {

  constructor() {
    super();
  }

  get template() {
    return super.extendTemplate(super.template, `
      <div style="padding: 1.5rem;">
        <h2>Bootstrap-like Grid Layout Test</h2>
        <p style="color:#666; margin-bottom:2rem;">
          Visual confirmation that the grid system (container / row / col-*) works correctly.
          Resize the window to verify responsive breakpoints: <code>xs</code>, <code>sm</code> (350px),
          <code>md</code> (600px), <code>lg</code> (992px), <code>xl</code> (1200px).
        </p>

        <!-- ── 1. Equal-width columns (.col) ─────────────────────────── -->
        <section style="margin-bottom:2.5rem;">
          <h3>1 · Equal-width columns <code>.col</code></h3>
          <div class="container-fluid">
            <div class="row" style="--bs-gutter-y:0.5rem;">
              <div class="col"><div style="background:#4a90d9;color:#fff;padding:1rem;border-radius:4px;text-align:center;">col</div></div>
              <div class="col"><div style="background:#4a90d9;color:#fff;padding:1rem;border-radius:4px;text-align:center;">col</div></div>
              <div class="col"><div style="background:#4a90d9;color:#fff;padding:1rem;border-radius:4px;text-align:center;">col</div></div>
            </div>
          </div>
        </section>

        <!-- ── 2. Fixed-width columns ─────────────────────────────────── -->
        <section style="margin-bottom:2.5rem;">
          <h3>2 · Fixed-width columns <code>.col-{n}</code> (12-column grid)</h3>
          <div class="container-fluid">
            <div class="row" style="--bs-gutter-y:0.5rem;">
              <div class="col-1"><div style="background:#e07b39;color:#fff;padding:.5rem 0;border-radius:4px;text-align:center;font-size:.75rem;">1</div></div>
              <div class="col-1"><div style="background:#e07b39;color:#fff;padding:.5rem 0;border-radius:4px;text-align:center;font-size:.75rem;">1</div></div>
              <div class="col-1"><div style="background:#e07b39;color:#fff;padding:.5rem 0;border-radius:4px;text-align:center;font-size:.75rem;">1</div></div>
              <div class="col-1"><div style="background:#e07b39;color:#fff;padding:.5rem 0;border-radius:4px;text-align:center;font-size:.75rem;">1</div></div>
              <div class="col-1"><div style="background:#e07b39;color:#fff;padding:.5rem 0;border-radius:4px;text-align:center;font-size:.75rem;">1</div></div>
              <div class="col-1"><div style="background:#e07b39;color:#fff;padding:.5rem 0;border-radius:4px;text-align:center;font-size:.75rem;">1</div></div>
              <div class="col-1"><div style="background:#e07b39;color:#fff;padding:.5rem 0;border-radius:4px;text-align:center;font-size:.75rem;">1</div></div>
              <div class="col-1"><div style="background:#e07b39;color:#fff;padding:.5rem 0;border-radius:4px;text-align:center;font-size:.75rem;">1</div></div>
              <div class="col-1"><div style="background:#e07b39;color:#fff;padding:.5rem 0;border-radius:4px;text-align:center;font-size:.75rem;">1</div></div>
              <div class="col-1"><div style="background:#e07b39;color:#fff;padding:.5rem 0;border-radius:4px;text-align:center;font-size:.75rem;">1</div></div>
              <div class="col-1"><div style="background:#e07b39;color:#fff;padding:.5rem 0;border-radius:4px;text-align:center;font-size:.75rem;">1</div></div>
              <div class="col-1"><div style="background:#e07b39;color:#fff;padding:.5rem 0;border-radius:4px;text-align:center;font-size:.75rem;">1</div></div>
            </div>
            <div class="row" style="margin-top:.5rem; --bs-gutter-y:0.5rem;">
              <div class="col-4"><div style="background:#5baa6e;color:#fff;padding:.75rem;border-radius:4px;text-align:center;">col-4</div></div>
              <div class="col-4"><div style="background:#5baa6e;color:#fff;padding:.75rem;border-radius:4px;text-align:center;">col-4</div></div>
              <div class="col-4"><div style="background:#5baa6e;color:#fff;padding:.75rem;border-radius:4px;text-align:center;">col-4</div></div>
            </div>
            <div class="row" style="margin-top:.5rem; --bs-gutter-y:0.5rem;">
              <div class="col-3"><div style="background:#9b59b6;color:#fff;padding:.75rem;border-radius:4px;text-align:center;">col-3</div></div>
              <div class="col-6"><div style="background:#9b59b6;color:#fff;padding:.75rem;border-radius:4px;text-align:center;">col-6</div></div>
              <div class="col-3"><div style="background:#9b59b6;color:#fff;padding:.75rem;border-radius:4px;text-align:center;">col-3</div></div>
            </div>
            <div class="row" style="margin-top:.5rem; --bs-gutter-y:0.5rem;">
              <div class="col-2"><div style="background:#c0392b;color:#fff;padding:.75rem;border-radius:4px;text-align:center;">col-2</div></div>
              <div class="col-8"><div style="background:#c0392b;color:#fff;padding:.75rem;border-radius:4px;text-align:center;">col-8</div></div>
              <div class="col-2"><div style="background:#c0392b;color:#fff;padding:.75rem;border-radius:4px;text-align:center;">col-2</div></div>
            </div>
          </div>
        </section>

        <!-- ── 3. Responsive breakpoints ─────────────────────────────── -->
        <section style="margin-bottom:2.5rem;">
          <h3>3 · Responsive breakpoints</h3>
          <p style="color:#666; font-size:.85rem;">
            On <strong>xs</strong>: stacked (full-width). On <strong>sm</strong>: 6/6. On <strong>md</strong>: 4/4/4. On <strong>lg+</strong>: 3/3/3/3.
          </p>
          <div class="container-fluid">
            <div class="row" style="--bs-gutter-y:0.5rem;">
              <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                <div style="background:#16a085;color:#fff;padding:1rem;border-radius:4px;text-align:center;">Block A</div>
              </div>
              <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                <div style="background:#16a085;color:#fff;padding:1rem;border-radius:4px;text-align:center;">Block B</div>
              </div>
              <div class="col-12 col-sm-12 col-md-4 col-lg-3">
                <div style="background:#16a085;color:#fff;padding:1rem;border-radius:4px;text-align:center;">Block C</div>
              </div>
              <div class="col-12 col-sm-12 col-md-12 col-lg-3">
                <div style="background:#16a085;color:#fff;padding:1rem;border-radius:4px;text-align:center;">Block D</div>
              </div>
            </div>
          </div>
        </section>

        <!-- ── 4. Gutters ─────────────────────────────────────────────── -->
        <section style="margin-bottom:2.5rem;">
          <h3>4 · Gutter utilities <code>g-0</code> → <code>g-5</code></h3>
          <div class="container-fluid">
            <div class="row g-0" style="margin-bottom:.5rem;">
              <div class="col-4"><div style="background:#bdc3c7;padding:.5rem;border-radius:4px;text-align:center;font-size:.8rem;">g-0</div></div>
              <div class="col-4"><div style="background:#bdc3c7;padding:.5rem;border-radius:4px;text-align:center;font-size:.8rem;">g-0</div></div>
              <div class="col-4"><div style="background:#bdc3c7;padding:.5rem;border-radius:4px;text-align:center;font-size:.8rem;">g-0</div></div>
            </div>
            <div class="row g-2" style="margin-bottom:.5rem;">
              <div class="col-4"><div style="background:#95a5a6;color:#fff;padding:.5rem;border-radius:4px;text-align:center;font-size:.8rem;">g-2</div></div>
              <div class="col-4"><div style="background:#95a5a6;color:#fff;padding:.5rem;border-radius:4px;text-align:center;font-size:.8rem;">g-2</div></div>
              <div class="col-4"><div style="background:#95a5a6;color:#fff;padding:.5rem;border-radius:4px;text-align:center;font-size:.8rem;">g-2</div></div>
            </div>
            <div class="row g-5">
              <div class="col-4"><div style="background:#7f8c8d;color:#fff;padding:.5rem;border-radius:4px;text-align:center;font-size:.8rem;">g-5</div></div>
              <div class="col-4"><div style="background:#7f8c8d;color:#fff;padding:.5rem;border-radius:4px;text-align:center;font-size:.8rem;">g-5</div></div>
              <div class="col-4"><div style="background:#7f8c8d;color:#fff;padding:.5rem;border-radius:4px;text-align:center;font-size:.8rem;">g-5</div></div>
            </div>
          </div>
        </section>

        <!-- ── 5. No-gutters ─────────────────────────────────────────── -->
        <section style="margin-bottom:2.5rem;">
          <h3>5 · No gutters <code>.no-gutters</code></h3>
          <div class="container-fluid">
            <div class="row no-gutters">
              <div class="col-3"><div style="background:#f39c12;color:#fff;padding:.75rem;text-align:center;">col-3</div></div>
              <div class="col-6"><div style="background:#e67e22;color:#fff;padding:.75rem;text-align:center;">col-6</div></div>
              <div class="col-3"><div style="background:#f39c12;color:#fff;padding:.75rem;text-align:center;">col-3</div></div>
            </div>
          </div>
        </section>

        <!-- ── 6. Auto-width column ───────────────────────────────────── -->
        <section style="margin-bottom:2.5rem;">
          <h3>6 · Auto-width column <code>.col-auto</code></h3>
          <div class="container-fluid">
            <div class="row" style="align-items:center;">
              <div class="col-auto">
                <div style="background:#2980b9;color:#fff;padding:.75rem 1.5rem;border-radius:4px;">auto</div>
              </div>
              <div class="col">
                <div style="background:#3498db;color:#fff;padding:.75rem;border-radius:4px;text-align:center;">fills remaining space (.col)</div>
              </div>
              <div class="col-auto">
                <div style="background:#2980b9;color:#fff;padding:.75rem 1.5rem;border-radius:4px;">auto</div>
              </div>
            </div>
          </div>
        </section>

        <!-- ── 7. Nested grid ─────────────────────────────────────────── -->
        <section style="margin-bottom:2.5rem;">
          <h3>7 · Nested grid</h3>
          <div class="container-fluid">
            <div class="row" style="--bs-gutter-y:0.5rem;">
              <div class="col-8">
                <div style="background:#ecf0f1;padding:1rem;border-radius:4px;">
                  <strong>Outer col-8</strong>
                  <div class="row" style="margin-top:.5rem; --bs-gutter-y:0.5rem;">
                    <div class="col-6"><div style="background:#a29bfe;color:#fff;padding:.5rem;border-radius:4px;text-align:center;">inner col-6</div></div>
                    <div class="col-6"><div style="background:#6c5ce7;color:#fff;padding:.5rem;border-radius:4px;text-align:center;">inner col-6</div></div>
                  </div>
                  <div class="row" style="margin-top:.5rem; --bs-gutter-y:0.5rem;">
                    <div class="col-4"><div style="background:#74b9ff;color:#fff;padding:.5rem;border-radius:4px;text-align:center;">inner col-4</div></div>
                    <div class="col-4"><div style="background:#0984e3;color:#fff;padding:.5rem;border-radius:4px;text-align:center;">inner col-4</div></div>
                    <div class="col-4"><div style="background:#74b9ff;color:#fff;padding:.5rem;border-radius:4px;text-align:center;">inner col-4</div></div>
                  </div>
                </div>
              </div>
              <div class="col-4">
                <div style="background:#fd79a8;color:#fff;padding:1rem;border-radius:4px;height:100%;">
                  <strong>Outer col-4</strong><br>sidebar
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ── 8. Container vs container-fluid ───────────────────────── -->
        <section style="margin-bottom:2.5rem;">
          <h3>8 · <code>.container</code> vs <code>.container-fluid</code></h3>
          <div class="container" style="background:#ffeaa7; padding:1rem; border-radius:4px; margin-bottom:.5rem;">
            <strong>.container</strong> — max-width constrained per breakpoint, centred
          </div>
          <div class="container-fluid" style="background:#fab1a0; padding:1rem; border-radius:4px;">
            <strong>.container-fluid</strong> — always full-width
          </div>
        </section>

      </div>
    `);
  }
}
