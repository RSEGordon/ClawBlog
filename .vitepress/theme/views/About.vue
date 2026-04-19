<template>
  <div class="about">
    <h1 class="title">关于本站</h1>
    <div class="about-content" style="grid-template-columns: 3fr 2fr">
      <!-- 介绍 -->
      <div class="about-item hello">
        <span class="text1">你好，很高兴认识你👋</span>
        <span class="text2 title2">我是 戈登</span>
        <span class="text3">海洋遥感硕士在读 / 独立开发者 / 摄影爱好者</span>
      </div>
      <!-- 追求 -->
      <div class="about-item pursuit">
        <span class="tip">追求</span>
        <span class="title2">源于</span>
        <span class="title2">好奇而去探索</span>
        <span class="title2">未知的边界</span>
      </div>
    </div>
    <div class="about-content" style="grid-template-columns: 2fr 3fr">
      <!-- 技能 -->
      <div class="about-item skills">
        <span class="tip">技能</span>
        <span class="title2">开启创造力</span>
        <div class="skills-list">
          <a
            v-for="(item, index) in skillsData"
            :key="index"
            :style="{ '--color': item.color }"
            :href="item.link"
            class="skills-item"
            target="_blank"
          >
            <div class="skills-logo">
              <i :class="`iconfont icon-${item.icon}`"></i>
            </div>
            <span class="skills-name">{{ item.name }}</span>
          </a>
        </div>
      </div>
      <!-- 性格 -->
      <div class="about-item character" style="--color: #4298b4">
        <span class="tip">性格</span>
        <span class="title2">理性探索</span>
        <span class="title2" style="color: var(--color)">INTP-A / INTP-T</span>
        <span class="more">
          在
          <a href="https://www.16personalities.com/ch/" target="_blank">16personalities</a>
          了解更多关于
          <a href="https://www.16personalities.com/ch/intp-%E4%BA%BA%E6%A0%BC" target="_blank">
            理性探索
          </a>
        </span>
      </div>
    </div>
    <div class="about-content" style="grid-template-columns: 1fr 1fr">
      <div
        class="about-item like image"
        style="
          --color: #8fa5b5;
          background-color: #e8e0db;
        "
      >
        <div class="image-content">
          <span class="tip">关注偏好</span>
          <span class="title2">海洋遥感 · ML</span>
          <div class="image-desc">
            <span class="left">Marine Heatwave · 卫星遥感 · 数据科学</span>
          </div>
        </div>
      </div>
      <div
        class="about-item like image"
        style="
          --color: #d4a5a5;
          background-color: #e0d4d4;
        "
      >
        <div class="image-content">
          <span class="tip">业余爱好</span>
          <span class="title2">摄影 · 折腾</span>
          <div class="image-desc">
            <span class="left">闲时拍拍东西，偶尔折腾点别的</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 心路历程 -->
    <div class="about-content" style="display: flex">
      <div class="about-item">
        <span class="tip">关于这个站</span>
        <span class="title2">为什么建站？</span>
        <p class="text">
          这里主要用来<strong>记录和分享</strong>我的研究笔记、技术折腾和生活随想。作为一个海洋遥感方向的博士生，日常接触大量遥感数据和分析工作，希望在这里沉淀一些有价值的内容。
        </p>
        <p class="text">
          内容偏向<strong>科研技术向</strong>，也会有一些日常记录。如果某篇文章恰好帮到了你，那也是一件开心的事。
        </p>
        <p class="text">
          有问题可以留言或通过友链方式联系，有缘相遇，共同进步。
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
const skillsData = [
  {
    name: "Python",
    color: "#3776AB",
    icon: "python",
    link: "https://www.python.org/",
  },
  {
    name: "JavaScript",
    color: "#f1e05abd",
    icon: "javascript",
    link: "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript",
  },
  {
    name: "Vue",
    color: "#41b883",
    icon: "vue",
    link: "https://cn.vuejs.org/",
  },
  {
    name: "Git",
    color: "#F05032",
    icon: "git",
    link: "https://git-scm.com/",
  },
  {
    name: "Docker",
    color: "#2496f2",
    icon: "docker",
    link: "https://www.docker.com/",
  },
  {
    name: "ChatGPT",
    color: "#4AA181",
    icon: "chatgpt",
    link: "https://chat.openai.com/",
  },
];
</script>

<style lang="scss" scoped>
.about {
  .title {
    font-size: 2.4rem;
    text-align: center;
    border: none;
  }
  .about-content {
    display: grid;
    grid-template-columns: auto auto;
    gap: 20px;
    margin-bottom: 20px;
    .about-item {
      background-color: var(--main-card-background);
      border: 1px solid var(--main-card-border);
      border-radius: 12px;
      padding: 20px;
      animation: show 0.5s backwards;
      &.hello {
        display: flex;
        flex-direction: column;
        .text1 {
          font-size: 20px;
          margin-bottom: 1rem;
        }
        .text2 {
          font-size: 32px;
          font-weight: bold;
          color: var(--main-color);
          margin-bottom: 1rem;
        }
        .text3 {
          font-size: 16px;
          color: var(--main-font-second-color);
        }
      }
      &.pursuit {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        .tip {
          background-color: var(--main-color);
          color: #fff;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          align-self: flex-start;
        }
        .title2 {
          font-size: 24px;
          font-weight: bold;
          margin-top: 1rem;
          text-align: center;
        }
      }
      &.skills {
        .skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 1rem;
          .skills-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 60px;
            padding: 8px;
            border-radius: 12px;
            background-color: var(--main-color-bg);
            text-decoration: none;
            transition: transform 0.3s;
            .skills-logo {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background-color: var(--color);
              .iconfont {
                font-size: 18px;
                color: #fff;
              }
            }
            .skills-name {
              font-size: 12px;
              margin-top: 4px;
              color: var(--main-font-color);
            }
            &:hover {
              transform: scale(1.1);
            }
          }
        }
      }
      &.career {
        display: flex;
        flex-direction: column;
        .tip {
          background-color: var(--main-color);
          color: #fff;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          align-self: flex-start;
        }
        .title2 {
          font-size: 24px;
          font-weight: bold;
          margin-top: 1rem;
          i {
            font-style: normal;
            color: var(--main-color);
          }
        }
        .list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 1rem;
          .list-item {
            font-size: 14px;
            padding: 4px 12px;
            border-radius: 8px;
            border-left: 3px solid;
            color: var(--main-font-color);
          }
        }
      }
      &.character {
        display: flex;
        flex-direction: column;
        .tip {
          background-color: var(--main-color);
          color: #fff;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          align-self: flex-start;
        }
        .title2 {
          font-size: 24px;
          font-weight: bold;
          margin-top: 1rem;
        }
        .more {
          font-size: 12px;
          color: var(--main-font-second-color);
          margin-top: 8px;
          a {
            color: var(--main-color);
          }
        }
      }
      &.like {
        display: flex;
        flex-direction: column;
        min-height: 170px;
        position: relative;
        overflow: hidden;
        background-size: 100%;
        background-position: center;
        transition: background-size 1.5s ease-in-out;
        &:hover {
          background-size: 120%;
        }
        .image-content {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          padding: 20px;
          background-color: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          color: #fff;
          border-radius: 0 0 12px 12px;
          .tip {
            background-color: var(--main-color);
            color: #fff;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
          }
          .title2 {
            font-size: 20px;
            font-weight: bold;
            margin-top: 8px;
          }
          .image-desc {
            margin-top: 4px;
            font-size: 12px;
            opacity: 0.8;
          }
        }
      }
    }
    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
