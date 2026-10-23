import { useEffect, useState } from "react";

const picture = "/assets/artwork/universe-scene-v3.webp";
const background = "/assets/artwork/universe-background-v3.webp";
// The same silhouettes clip the photograph and hide supports behind the metal.
const outerRingShape =
  "M720 248 C759 235 800 259 831 305 C875 368 867 450 826 490 C788 526 739 508 706 477 C654 431 639 369 659 315 C670 284 691 260 720 248Z M724 278 C702 291 688 325 695 363 C702 411 732 461 774 477 C809 479 835 444 833 405 C831 354 816 317 796 294 C771 274 745 269 724 278Z";
const innerRingShape =
  "M744 350 C765 340 787 356 800 382 C817 417 803 450 778 456 C754 459 731 440 719 414 C706 384 718 360 744 350Z M751 370 C735 381 736 403 745 421 C758 443 775 442 783 425 C791 405 779 380 767 373 C760 369 755 368 751 370Z";
const discs = [
  "M911 505 C921 491 1084 490 1102 504 L1105 527 C1097 545 929 550 912 534Z",
  "M806 536 C823 520 997 521 1018 537 L1020 566 C1006 583 820 590 806 572Z",
  "M855 586 C868 567 1061 568 1079 586 L1081 613 C1066 634 872 642 855 622Z",
  "M758 646 C774 624 990 623 1008 642 L1009 663 C996 686 772 692 757 673Z",
];
function Supports() {
  return (
    <>
      <line data-support="outer-left" x1="722" y1="125" x2="722" y2="258" />
      <line data-support="outer-right" x1="795" y1="125" x2="795" y2="285" />
      <line data-support="inner" x1="755" y1="125" x2="755" y2="354" />
    </>
  );
}

// Authored photographic layers only. This component never receives portfolio data.
export default function Artwork() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let live = true;
    Promise.all(
      [picture, background].map((src) => {
        const img = new Image();
        img.src = src;
        return img.decode();
      }),
    )
      .then(() => {
        if (live) setReady(true);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);
  return (
    <div
      className={`world-artwork ${ready ? "artwork-ready" : ""}`}
      aria-hidden="true"
    >
      <img
        className="artwork-poster"
        src={picture}
        alt=""
        fetchPriority="high"
      />
      <svg
        className="artwork-layers"
        viewBox="0 0 1584 993"
        preserveAspectRatio="xMidYMin slice"
        focusable="false"
      >
        <defs>
          <linearGradient id="metal-sheen">
            <stop offset="0" stopColor="#bce9ff" stopOpacity="0" />
            <stop offset=".42" stopColor="#c9edff" stopOpacity="0" />
            <stop offset=".5" stopColor="white" stopOpacity=".58" />
            <stop offset=".56" stopColor="#c5edff" stopOpacity=".16" />
            <stop offset=".7" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="floor-caustic">
            <stop stopColor="#e9fbff" stopOpacity=".6" />
            <stop offset=".45" stopColor="#d6f5ff" stopOpacity=".22" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <clipPath id="arch-cutout">
            <path
              clipRule="evenodd"
              d="M273 793 L273 567 C273 303 497 82 793 82 C1030 82 1167 302 1167 563 L1167 788 L1108 788 L1108 555 C1108 329 984 164 792 164 C555 164 358 350 358 567 L358 793Z"
            />
          </clipPath>
          <clipPath id="ribbon-cutout">
            <path d="M485 279 C467 273 446 296 429 329 C410 360 406 389 420 419 C428 447 450 471 467 496 C448 535 413 576 393 616 C378 641 390 676 402 699 C416 733 438 748 463 752 L535 752 C564 746 592 722 611 691 C636 656 647 629 654 599 C665 567 653 532 628 503 L587 460 C571 429 551 404 533 383 C515 359 506 326 501 301 C497 286 491 280 485 279Z" />
          </clipPath>
          <clipPath id="outer-ring-cutout">
            <path clipRule="evenodd" d={outerRingShape} />
          </clipPath>
          <clipPath id="inner-ring-cutout">
            <path clipRule="evenodd" d={innerRingShape} />
          </clipPath>
          {discs.map((d, i) => (
            <clipPath key={i} id={`glass-cutout-${i}`}>
              <path d={d} />
            </clipPath>
          ))}
        </defs>
        <image href={background} width="1584" height="993" />
        <g clipPath="url(#arch-cutout)">
          <rect
            className="artwork-sheen arch-sheen"
            x="-1000"
            y="0"
            width="1200"
            height="993"
            fill="url(#metal-sheen)"
          />
        </g>
        <g className="artwork-ribbon">
          <image
            href={picture}
            width="1584"
            height="993"
            clipPath="url(#ribbon-cutout)"
          />
          <g clipPath="url(#ribbon-cutout)">
            <rect
              className="artwork-sheen ribbon-sheen"
              x="-1000"
              y="0"
              width="1200"
              height="993"
              fill="url(#metal-sheen)"
            />
          </g>
        </g>
        <g className="artwork-outer-ring">
          <image
            href={picture}
            width="1584"
            height="993"
            clipPath="url(#outer-ring-cutout)"
          />
          <g clipPath="url(#outer-ring-cutout)">
            <rect
              className="artwork-sheen ring-sheen"
              x="-1000"
              y="0"
              width="1200"
              height="993"
              fill="url(#metal-sheen)"
            />
          </g>
        </g>
        <g className="artwork-inner-ring">
          <image
            href={picture}
            width="1584"
            height="993"
            clipPath="url(#inner-ring-cutout)"
          />
        </g>
        <g className="artwork-glass">
          {discs.map((_, i) => (
            <g key={i} className={`artwork-disc artwork-disc-${i + 1}`}>
              <image
                href={picture}
                width="1584"
                height="993"
                clipPath={`url(#glass-cutout-${i})`}
              />
              <g clipPath={`url(#glass-cutout-${i})`}>
                <rect
                  className="artwork-sheen glass-sheen"
                  x="-1000"
                  y="0"
                  width="1200"
                  height="993"
                  fill="url(#metal-sheen)"
                />
              </g>
            </g>
          ))}
        </g>
        <ellipse
          className="artwork-caustic"
          cx="844"
          cy="866"
          rx="285"
          ry="48"
          fill="url(#floor-caustic)"
        />
        <g className="artwork-glints" stroke="white" strokeLinecap="round">
          <path className="glint glint-one" d="M428 441h14 M435 434v14" />
          <path className="glint glint-two" d="M807 452h12 M813 446v12" />
          <path className="glint glint-three" d="M1009 538h14 M1016 531v14" />
        </g>
      </svg>
      <svg
        className="artwork-supports"
        viewBox="0 0 1584 993"
        preserveAspectRatio="xMidYMin slice"
        focusable="false"
      >
        <defs>
          <clipPath id="supports-aperture">
            <path d="M358 993V567C358 350 555 164 792 164C984 164 1108 329 1108 555V993Z" />
          </clipPath>
          <mask
            id="supports-behind-metal"
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="1584"
            height="993"
            style={{ maskType: "luminance" }}
          >
            <rect width="1584" height="993" fill="white" />
            <g className="artwork-outer-ring">
              <path d={outerRingShape} fill="black" fillRule="evenodd" />
            </g>
            <g className="artwork-inner-ring">
              <path d={innerRingShape} fill="black" fillRule="evenodd" />
            </g>
          </mask>
        </defs>
        <g
          className="fixed-supports"
          clipPath="url(#supports-aperture)"
          mask="url(#supports-behind-metal)"
        >
          <Supports />
        </g>
      </svg>
    </div>
  );
}
