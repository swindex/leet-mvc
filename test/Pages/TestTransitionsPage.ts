// @ts-nocheck
import { HeaderPage } from "../../pages/HeaderPage/HeaderPage";

export class TestTransitionsPage extends HeaderPage {
  fadeCounter: number;
  slideCounter: number;
  scaleCounter: number;
  rotateCounter: number;
  customCounter: number;
  currentView: number;
  imageIndex: number;

  constructor() {
    super();
    
    this.fadeCounter = 0;
    this.slideCounter = 0;
    this.scaleCounter = 0;
    this.rotateCounter = 0;
    this.customCounter = 0;
    this.currentView = 1;
    this.imageIndex = 0;
  }

  nextFade() {
    this.fadeCounter++;
  }

  nextSlide() {
    this.slideCounter++;
  }

  nextScale() {
    this.scaleCounter++;
  }

  nextRotate() {
    this.rotateCounter++;
  }

  nextCustom() {
    this.customCounter++;
  }

  switchView(view: number) {
    this.currentView = view;
  }

  nextImage() {
    this.imageIndex = (this.imageIndex + 1) % 3;
  }

  previousImage() {
    this.imageIndex = (this.imageIndex - 1 + 3) % 3;
  }

  get template() {
    return super.extendTemplate(super.template, `
      <style>
        /* Fade Transition */
        .fade-enter_active, .fade-leave_active {
          transition: opacity 500ms ease;
        }
        .fade-enter, .fade-leave_to {
          opacity: 0;
        }
        .fade-enter_to, .fade-leave {
          opacity: 1;
        }

        /* Slide Transition */
        .slide-enter_active, .slide-leave_active {
          transition: transform 500ms ease, opacity 500ms ease;
        }
        .slide-enter {
          transform: translateX(100%);
          opacity: 0;
        }
        .slide-enter_to {
          transform: translateX(0);
          opacity: 1;
        }
        .slide-leave {
          transform: translateX(0);
          opacity: 1;
        }
        .slide-leave_to {
          transform: translateX(-100%);
          opacity: 0;
        }

        /* Scale Transition */
        .scale-enter_active, .scale-leave_active {
          transition: transform 400ms ease, opacity 400ms ease;
        }
        .scale-enter {
          transform: scale(0);
          opacity: 0;
        }
        .scale-enter_to {
          transform: scale(1);
          opacity: 1;
        }
        .scale-leave {
          transform: scale(1);
          opacity: 1;
        }
        .scale-leave_to {
          transform: scale(0);
          opacity: 0;
        }

        /* Rotate Transition */
        .rotate-enter_active, .rotate-leave_active {
          transition: transform 600ms ease, opacity 600ms ease;
        }
        .rotate-enter {
          transform: rotate(-180deg) scale(0);
          opacity: 0;
        }
        .rotate-enter_to {
          transform: rotate(0deg) scale(1);
          opacity: 1;
        }
        .rotate-leave {
          transform: rotate(0deg) scale(1);
          opacity: 1;
        }
        .rotate-leave_to {
          transform: rotate(180deg) scale(0);
          opacity: 0;
        }

        /* Bounce Transition */
        .bounce-enter_active {
          animation: bounce-in 500ms;
        }
        .bounce-leave_active {
          animation: bounce-out 500ms;
        }
        @keyframes bounce-in {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        @keyframes bounce-out {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(0); }
        }

        /* Flip Transition */
        .flip-enter_active, .flip-leave_active {
          transition: transform 600ms ease;
          transform-style: preserve-3d;
        }
        .flip-enter {
          transform: rotateY(-180deg);
        }
        .flip-enter_to {
          transform: rotateY(0deg);
        }
        .flip-leave {
          transform: rotateY(0deg);
        }
        .flip-leave_to {
          transform: rotateY(180deg);
        }

        /* Zoom Transition */
        .zoom-enter_active, .zoom-leave_active {
          transition: transform 300ms ease, opacity 300ms ease;
        }
        .zoom-enter {
          transform: scale(2);
          opacity: 0;
        }
        .zoom-enter_to {
          transform: scale(1);
          opacity: 1;
        }
        .zoom-leave {
          transform: scale(1);
          opacity: 1;
        }
        .zoom-leave_to {
          transform: scale(0.5);
          opacity: 0;
        }

        /* Content boxes */
        .transition-box {
          padding: 20px;
          margin: 10px 0;
          border-radius: 8px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-size: 18px;
          text-align: center;
        }

        .view-box {
          padding: 30px;
          margin: 10px 0;
          border-radius: 8px;
          min-height: 150px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: bold;
        }

        .view-1 { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
        .view-2 { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
        .view-3 { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
        .view-4 { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }

        .image-container {
          position: relative;
          width: 100%;
          height: 300px;
          background: #f0f0f0;
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .image-box {
          position: absolute;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          font-weight: bold;
          color: white;
        }

        .image-1 { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .image-2 { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
        .image-3 { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
      </style>

      <div class="fill scroll" style="padding: 20px;">
        <h2>[transition] Directive Tests</h2>
        <p><em>The [transition] directive provides smooth enter/leave animations using CSS transitions</em></p>

        <hr>

        <h3>1. Fade Transition</h3>
        <div style="margin-bottom: 20px;">
          <button onclick="this.nextFade()" class="btn btn-primary">
            Next Content ({{ this.fadeCounter }})
          </button>
          
          <div [transition]="{
            trigger: this.fadeCounter,
            duration: 500,
            enter: 'fade-enter',
            enter_active: 'fade-enter_active',
            enter_to: 'fade-enter_to',
            leave: 'fade-leave',
            leave_active: 'fade-leave_active',
            leave_to: 'fade-leave_to'
          }">
            <div class="transition-box">
              <strong>Fade Transition Content</strong>
              <p>Counter: {{ this.fadeCounter }}</p>
              <p>This content fades in and out smoothly</p>
            </div>
          </div>
        </div>

        <hr>

        <h3>2. Slide Transition</h3>
        <div style="margin-bottom: 20px;">
          <button onclick="this.nextSlide()" class="btn btn-primary">
            Next Slide ({{ this.slideCounter }})
          </button>
          
          <div style="overflow: hidden; position: relative;">
            <div [transition]="{
              trigger: this.slideCounter,
              duration: 500,
              enter: 'slide-enter',
              enter_active: 'slide-enter_active',
              enter_to: 'slide-enter_to',
              leave: 'slide-leave',
              leave_active: 'slide-leave_active',
              leave_to: 'slide-leave_to'
            }">
              <div class="transition-box">
                <strong>Slide Transition Content</strong>
                <p>Counter: {{ this.slideCounter }}</p>
                <p>Slides from right to left</p>
              </div>
            </div>
          </div>
        </div>

        <hr>

        <h3>3. Scale Transition</h3>
        <div style="margin-bottom: 20px;">
          <button onclick="this.nextScale()" class="btn btn-primary">
            Next Scale ({{ this.scaleCounter }})
          </button>
          
          <div [transition]="{
            trigger: this.scaleCounter,
            duration: 400,
            enter: 'scale-enter',
            enter_active: 'scale-enter_active',
            enter_to: 'scale-enter_to',
            leave: 'scale-leave',
            leave_active: 'scale-leave_active',
            leave_to: 'scale-leave_to'
          }">
            <div class="transition-box">
              <strong>Scale Transition Content</strong>
              <p>Counter: {{ this.scaleCounter }}</p>
              <p>Scales from 0 to full size</p>
            </div>
          </div>
        </div>

        <hr>

        <h3>4. Rotate Transition</h3>
        <div style="margin-bottom: 20px;">
          <button onclick="this.nextRotate()" class="btn btn-primary">
            Next Rotate ({{ this.rotateCounter }})
          </button>
          
          <div [transition]="{
            trigger: this.rotateCounter,
            duration: 600,
            enter: 'rotate-enter',
            enter_active: 'rotate-enter_active',
            enter_to: 'rotate-enter_to',
            leave: 'rotate-leave',
            leave_active: 'rotate-leave_active',
            leave_to: 'rotate-leave_to'
          }">
            <div class="transition-box">
              <strong>Rotate Transition Content</strong>
              <p>Counter: {{ this.rotateCounter }}</p>
              <p>Rotates and scales during transition</p>
            </div>
          </div>
        </div>

        <hr>

        <h3>5. View Switcher with Transitions</h3>
        <div style="margin-bottom: 20px;">
          <div style="margin-bottom: 10px;">
            <button onclick="this.switchView(1)" class="btn btn-primary">View 1</button>
            <button onclick="this.switchView(2)" class="btn btn-primary">View 2</button>
            <button onclick="this.switchView(3)" class="btn btn-primary">View 3</button>
            <button onclick="this.switchView(4)" class="btn btn-primary">View 4</button>
          </div>

          <div [transition]="{
            trigger: this.currentView,
            duration: 500,
            enter: 'fade-enter',
            enter_active: 'fade-enter_active',
            enter_to: 'fade-enter_to',
            leave: 'fade-leave',
            leave_active: 'fade-leave_active',
            leave_to: 'fade-leave_to'
          }">
            <div [if]="this.currentView === 1">
              <div class="view-box view-1">View 1: User Dashboard</div>
            </div>
            <div [if]="this.currentView === 2">
              <div class="view-box view-2">View 2: Settings Panel</div>
            </div>
            <div [if]="this.currentView === 3">
              <div class="view-box view-3">View 3: Analytics</div>
            </div>
            <div [if]="this.currentView === 4">
              <div class="view-box view-4">View 4: Reports</div>
            </div>
          </div>
        </div>

        <hr>

        <h3>6. Image Carousel with Transitions</h3>
        <div style="margin-bottom: 20px;">
          <div style="margin-bottom: 10px;">
            <button onclick="this.previousImage()" class="btn btn-secondary">← Previous</button>
            <button onclick="this.nextImage()" class="btn btn-primary">Next →</button>
            <span style="margin-left: 10px;">Image {{ this.imageIndex + 1 }} of 3</span>
          </div>

          <div class="image-container">
            <div [transition]="{
              trigger: this.imageIndex,
              duration: 500,
              enter: 'slide-enter',
              enter_active: 'slide-enter_active',
              enter_to: 'slide-enter_to',
              leave: 'slide-leave',
              leave_active: 'slide-leave_active',
              leave_to: 'slide-leave_to'
            }">
              <div [if]="this.imageIndex === 0">
                <div class="image-box image-1">Image 1</div>
              </div>
              <div [if]="this.imageIndex === 1">
                <div class="image-box image-2">Image 2</div>
              </div>
              <div [if]="this.imageIndex === 2">
                <div class="image-box image-3">Image 3</div>
              </div>
            </div>
          </div>
        </div>

        <hr>

        <h3>7. Transition Configuration Reference</h3>
        <div style="margin-bottom: 20px;">
          <div style="padding: 15px; background: #f8f9fa; border: 1px solid #ddd; border-radius: 5px;">
            <h4>Transition Options:</h4>
            <pre style="margin: 10px 0; padding: 10px; background: #282c34; color: #abb2bf; border-radius: 3px; overflow-x: auto;">
[transition]="{
  trigger: value,           // When this changes, transition occurs
  duration: 500,           // Duration in milliseconds
  enter: 'enter',          // Initial enter class
  enter_active: 'enter_active',  // Active enter class (for transition)
  enter_to: 'enter_to',    // Final enter class
  leave: 'leave',          // Initial leave class
  leave_active: 'leave_active',  // Active leave class (for transition)
  leave_to: 'leave_to'     // Final leave class
}"</pre>

            <h4 style="margin-top: 20px;">How it works:</h4>
            <ol style="line-height: 1.8;">
              <li><strong>Trigger:</strong> When the trigger value changes, the transition starts</li>
              <li><strong>Enter Phase:</strong> New content gets enter + enter_active classes</li>
              <li><strong>Leave Phase:</strong> Old content gets leave + leave_active classes</li>
              <li><strong>After 16ms:</strong> enter/leave classes removed, enter_to/leave_to added</li>
              <li><strong>After duration:</strong> Old element removed, all classes cleaned up</li>
            </ol>

            <h4 style="margin-top: 20px;">CSS Pattern:</h4>
            <pre style="margin: 10px 0; padding: 10px; background: #282c34; color: #abb2bf; border-radius: 3px; overflow-x: auto;">
.fade-enter_active, .fade-leave_active {
  transition: opacity 500ms ease;
}
.fade-enter, .fade-leave_to {
  opacity: 0;
}
.fade-enter_to, .fade-leave {
  opacity: 1;
}</pre>
          </div>
        </div>

        <hr>

        <h3>8. Performance Note</h3>
        <div style="margin-bottom: 20px;">
          <div style="padding: 15px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 5px;">
            <p><strong>⚡ Performance Tips:</strong></p>
            <ul>
              <li>Use transform and opacity for smoothest animations (GPU accelerated)</li>
              <li>Avoid animating width, height, or other layout properties</li>
              <li>Keep duration reasonable (200-600ms typically)</li>
              <li>Test on lower-end devices to ensure smooth performance</li>
              <li>Consider using will-change: transform for complex animations</li>
            </ul>
          </div>
        </div>

      </div>
    `);
  }
}