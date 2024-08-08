import { ViewPlugin } from "@codemirror/view";
import { foldedRanges } from "@codemirror/language";

export const verticalLingRulerPlugin = ViewPlugin.fromClass(
  class {
    constructor(view) {
      this.view = view;

      this.verticalLingRulerContainor = view.dom
        .querySelector(".cm-scroller")
        .appendChild(document.createElement("div"));

      this.verticalLingRulerContainor.classList.add("vertical-ruler-containor");
    }

    update(update) {
      const { state } = this.view;
      const { doc } = state;

      if (update.geometryChanged) {
        const LineNums = doc.lines;
        let flag = false; // line을 그릴지 말지 판단하는 flag
        let startFlag = false; // flag가 시작된 첫번 째 줄은 line을 그리지 않기 위해 사용된 flag
        let leftSizeArr = Array(0); // line의 수평 중첩을 저장해주는 stack (앞 공백 stack 저장)

        // foldedRanges를 활용해 state의 folding 정보 받아오기
        const foldRanges = foldedRanges(state);
        const foldedLinesArr = Array(LineNums + 1).fill(false);
        const foldedSize = foldRanges?.chunk[0]?.from?.length;
        const chunkPos = foldRanges.chunkPos[0];
        const fromArr = foldRanges?.chunk[0]?.from;
        const toArr = foldRanges?.chunk[0]?.to;

        /**
         * 설명: state의 foldedRanges(접힌 부분의 chunk 정보를 줌)를 받아서
         * 실제로 접힌 line을 찾아서 foldedLinesArr에 반영해주는 함수
         */
        this.findFoldedLine(
          doc,
          foldedLinesArr,
          foldedSize,
          chunkPos,
          fromArr,
          toArr
        );

        let foldedLineUptoSum = 0; //현재 줄 이전 줄들의 접힌 줄의 개수의 합을 저장

        // verticalLine을 초기화
        this.clearVerticalLine();

        /**
         * 설명: 첫번째 줄 부터 내려가면서 수직 선을 그려 나감
         */
        this.drawVerticalLine(
          doc,
          foldedLinesArr,
          foldedLineUptoSum,
          LineNums,
          startFlag,
          flag,
          leftSizeArr
        );
      }
    }

    // verticalLine을 초기화
    clearVerticalLine() {
      while (this.verticalLingRulerContainor.hasChildNodes()) {
        this.verticalLingRulerContainor.removeChild(
          this.verticalLingRulerContainor.firstChild
        );
      }
    }

    /**
     * 설명: state의 foldedRanges(접힌 부분의 chunk 정보를 줌)를 받아서
     * 실제로 접힌 line을 찾아서 foldedLinesArr에 반영해주는 함수
     */
    findFoldedLine(doc, foldedLinesArr, foldedSize, chunkPos, fromArr, toArr) {
      for (let i = 0; i < foldedSize; i++) {
        const from = fromArr[i] + chunkPos;
        const to = toArr[i] + chunkPos;
        const fromLine = doc.lineAt(from).number;
        const toLine = doc.lineAt(to).number;

        for (let j = fromLine + 1; j < toLine; j++) {
          foldedLinesArr[j] = true;
        }
      }
    }

    /**
     * 설명: 첫번째 줄 부터 내려가면서 수직 선을 그려 나감
     */
    drawVerticalLine(
      doc,
      foldedLinesArr,
      foldedLineUptoSum,
      LineNums,
      startFlag,
      flag,
      leftSizeArr
    ) {
      for (let line = 1; line <= LineNums; line++) {
        let lineText = doc.line(line).text;
        startFlag = false;

        // 현재 줄이 접힌 줄인지 확인하고, 접힌 줄이면 그리지 않고 패스
        let isFoldedLine = foldedLinesArr[line];
        if (isFoldedLine) {
          foldedLineUptoSum++;
          continue;
        }
        // 현재 줄이 '{', '}' 다 포함하고 있으면 각 상태 업데이트 없이 바로 draw 단계 진입
        if (lineText.includes("{") || lineText.includes("}")) {
          if (flag || leftSizeArr.length !== 0) {
            for (let i = 0; i < leftSizeArr.length; i++) {
              if (startFlag === true) {
                if (i === leftSizeArr.length - 1) continue;
              }
              // line을 그려야 함
              this.VericalLine = this.verticalLingRulerContainor.appendChild(
                document.createElement("div")
              );
              let topPositionIndex = 0; //접힘에 따라서 행 보간식이 달라짐
              if (foldedLineUptoSum > 0) {
                topPositionIndex = line - 2 - foldedLineUptoSum - 1;
              } else {
                topPositionIndex = line - 2;
              }
              const top = line === 1 ? 0 : 29.19 + 25.19 * topPositionIndex; //몇번째 행에 그려야 하는가?
              const left = 96 + 9 * leftSizeArr[i]; //몇번째 열에 그려야 하는가?
              this.VericalLine.style.cssText = `position: absolute; top:${top}px; left:${left}px`;
              this.VericalLine.classList.add("vertical-line");
            }
          }

          continue;
        }

        if (lineText.includes("}") || lineText.includes("*/")) {
          // 구건이 끝남
          flag = false;
          leftSizeArr.pop(); //leftSize 초기화
        }

        if (flag || leftSizeArr.length !== 0) {
          for (let i = 0; i < leftSizeArr.length; i++) {
            if (startFlag === true) {
              if (i === leftSizeArr.length - 1) continue;
            }
            // line을 그려야 함
            this.VericalLine = this.verticalLingRulerContainor.appendChild(
              document.createElement("div")
            );
            let topPositionIndex = 0; //접힘에 따라서 행 보간식이 달라짐
            if (foldedLineUptoSum > 0) {
              topPositionIndex = line - 2 - foldedLineUptoSum - 1;
            } else {
              topPositionIndex = line - 2;
            }
            const top = line === 1 ? 0 : 29.19 + 25.19 * topPositionIndex; //몇번째 행에 그려야 하는가?
            const left = 96 + 9 * leftSizeArr[i]; //몇번째 열에 그려야 하는가?
            this.VericalLine.style.cssText = `position: absolute; top:${top}px; left:${left}px`;
            this.VericalLine.classList.add("vertical-line");
          }
        }

        if (lineText.includes("{") || lineText.includes("/**")) {
          // 구간에 들어옴
          flag = true;
          startFlag = true;
          // &nbsp;를 공백으로 변환합니다
          lineText = lineText.replace(/&nbsp;/g, " ");

          // 줄의 앞부분 공백을 계산합니다
          const regMatch = lineText.match(/^ +/);
          const tempLeftSize = regMatch ? regMatch[0].length : 0;
          leftSizeArr.push(tempLeftSize);
        }
      }
    }
    destroy() {}
  }
);
