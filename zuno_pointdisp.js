// ==UserScript==
// @name         zuno_voting_helper
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  mixi大喜利頭脳の投票ヘルパー
// @author       めえ @ununknot
// @include      https://mixi.jp/*comm_id=170058&page=all
// @grant        none
// ==/UserScript==

// ネタ情報クラス
class Neta
{
    constructor(no, name, neta) {
        this.commentNo = no
        this.userName = name
        this.neta = neta
        this.checked = false;
    }
}

// ネタ情報クラスをあつめる
let netaData = []


// ユーザー名のノードまとめとく
let nameElms = []

// 審査コメントまとめとく
let otherVotes = []

// 投票数
let voteCount = 0
let maxVote = 0

// エントリポイント
class Zuno {
    constructor() {
        let baseElm = createBase()
        let ctlPanel = createParts()
        baseElm.appendChild(ctlPanel)
        document.body.appendChild(baseElm)
        odaiSetting()
        commentViewSetting()
        changedHiddenName()
        changedHiddenOtherVote()
        changeFirstExperience()
        setVoteCount()
    }
}


const createBase = () => {
    // 表示のベース
    let baseElm = document.createElement('div')
    baseElm.style.backgroundColor = '#fcfcfc'
    // baseElm.style.maxWidth = '30%'
    // baseElm.style.height = '60%'
    baseElm.style.fontSize = '14px'
    baseElm.style.position = 'fixed'
    baseElm.style.top = '100px'
    baseElm.style.right = '5px'
    baseElm.style.display = 'flex'
    baseElm.style.border = 'solid navy 2px'
    return baseElm
}

const createParts = () => {
    // 操作用部品各種
    let ctlPanel = document.createElement('div')
    ctlPanel.style.height = '100%'
    ctlPanel.style.width = '100%'
    ctlPanel.style.padding = '10px 10px 5px 10px'


    // 投票数カウント
    let maxVoteStatus = document.createElement('span')
    maxVoteStatus.id = 'maxVoteStatus'
    maxVoteStatus.style.fontSize = '12px'
    let voteCountStatus = document.createElement('span')
    voteCountStatus.id = 'voteCountStatus'

    // 選択ネタプレビュー
    let voteNetaArea = document.createElement('textarea')
    voteNetaArea.id = 'previewArea'
    voteNetaArea.rows = '10'
    voteNetaArea.cols = '35'
    voteNetaArea.placeholder = '選んだネタ'

    // 選択可能数
    let firstExperience = document.createElement('input')
    firstExperience.id = 'firstExperience'
    firstExperience.type = 'checkbox'
    firstExperience.addEventListener('change', changeFirstExperience)
    let firstExperienceLabel = document.createElement('label')
    firstExperienceLabel.for = firstExperience.id
    firstExperienceLabel.innerText = '過去1位になったことがある？'
    firstExperienceLabel.style.fontSize = '11px'
    let ex = divIn(firstExperience, firstExperienceLabel)
    ex.style.textAlign = 'right'

    ctlPanel.appendChild(ex)
    ctlPanel.appendChild(divIn(voteCountStatus, maxVoteStatus))
    ctlPanel.appendChild(voteNetaArea)


    // 名前を隠す
    let hiddenNameSwitch = document.createElement('input')
    hiddenNameSwitch.id = 'hiddenName'
    hiddenNameSwitch.type = 'checkbox'
    hiddenNameSwitch.checked = 'checked'
    hiddenNameSwitch.addEventListener('change', changedHiddenName)
    let hiddenNameLabel = document.createElement('label')
    hiddenNameLabel.for = hiddenNameSwitch.id
    hiddenNameLabel.innerText = '名前を隠す'
    // 他の人の審査を隠す
    let hiddenOtherVote = document.createElement('input')
    hiddenOtherVote.id = 'hiddenOtherVote'
    hiddenOtherVote.type = 'checkbox'
    hiddenOtherVote.checked = 'checked'
    hiddenOtherVote.addEventListener('change', changedHiddenOtherVote)
    let hiddenOtherVoteLabel = document.createElement('label')
    hiddenOtherVoteLabel.for = hiddenOtherVote.id
    hiddenOtherVoteLabel.innerText = '他の人の審査を隠す'

    ctlPanel.appendChild(divIn(hiddenNameSwitch, hiddenNameLabel))
    ctlPanel.appendChild(divIn(hiddenOtherVote, hiddenOtherVoteLabel))

    // 簡易審査
    let simpleVote = document.createElement('input')
    simpleVote.id = 'simpleVote'
    simpleVote.type = 'checkbox'
    let simpleVoteLabel = document.createElement('label')
    simpleVoteLabel.for = simpleVote.id
    simpleVoteLabel.innerText = '簡易審査'

    ctlPanel.appendChild(divIn(simpleVote, simpleVoteLabel))

    // 配点権選択
    let voteOne = document.createElement('input')
    voteOne.id = 'voteOne'
    voteOne.name = 'votePoint'
    voteOne.type = 'radio'
    voteOne.value = "1"
    voteOne.checked = 'checked'
    let voteOneLabel = document.createElement('label')
    voteOneLabel.for = voteOne.id
    voteOneLabel.innerText = '配点権1点'
    voteOneLabel.style.paddingRight = '3px'
    let voteTwo = document.createElement('input')
    voteTwo.id = 'voteTwo'
    voteTwo.name = 'votePoint'
    voteTwo.type = 'radio'
    voteTwo.value = "2"
    let voteTwoLabel = document.createElement('label')
    voteTwoLabel.for = voteTwo.id
    voteTwoLabel.innerText = '配点権2点'
    voteTwoLabel.style.paddingRight = '3px'
    let voteThree = document.createElement('input')
    voteThree.name = 'votePoint'
    voteThree.type = 'radio'
    voteThree.value = "3"
    let voteThreeLabel = document.createElement('label')
    voteThreeLabel.for = voteThree.id
    voteThreeLabel.innerText = '配点権3点'
    voteThreeLabel.style.paddingRight = '3px'
    let block2 = document.createElement('div')
    block2.style.textAlign = 'left'
    block2.style.padding = '3px 0 3px 3px'
    block2.appendChild(voteOne)
    block2.appendChild(voteOneLabel)
    block2.appendChild(voteTwo)
    block2.appendChild(voteTwoLabel)
    block2.appendChild(voteThree)
    block2.appendChild(voteThreeLabel)
    ctlPanel.appendChild(block2)

    // 投票用テキスト生成ボタン
    let resultBtn = document.createElement('button')
    resultBtn.textContent = '審査コメントを作成＆投稿欄にスクロール'
    resultBtn.addEventListener('click', setResult)
    // 審査コメントにネタも含める
    let voteWithNeta = document.createElement('input')
    voteWithNeta.id = 'voteWithNeta'
    voteWithNeta.type = 'checkbox'
    voteWithNeta.checked = 'checked'
    let voteWithNetaLabel = document.createElement('label')
    voteWithNetaLabel.for = voteWithNeta.id
    voteWithNetaLabel.innerText = '審査コメントにネタも含める（標準審査のみ）'

    ctlPanel.appendChild(divIn(voteWithNeta, voteWithNetaLabel))
    ctlPanel.appendChild(resultBtn)

    return ctlPanel
}

const odaiSetting = () => {
    // お題位置を固定
    const odai = getComCardBlockBody(document)
    odai.style.position = 'fixed'
    odai.style.top = '100px'
    odai.style.left = '3%'
    odai.style.maxHeight = '300px'
    odai.style.width = '60%'
    odai.style.overflowY = 'scroll'
    odai.style.backgroundColor = '#fcfcfc'
    odai.style.border = 'solid navy 2px'
    odai.style.zIndex = '1'
    getComCardBlockBodyReactionBox(odai).style.display = 'none'
}

const commentViewSetting = () => {
    // 投稿を集めておいたり表示を加工したり

    const comments = document.querySelectorAll("div[class^='COMMUNITY_cardBlock__bbsCommentBox JS_commentDeleteTarget_']")
    // 〆切の位置
    const shimekiriComment = Array.from(comments).filter(c => getComCardBlockBodyItem(c)
                                    .innerText.includes('終了です！沢山のご回答ありがとうございました。'))

    const shimekiriNo = shimekiriComment[0] ? getCommentNo(shimekiriComment[0]) : "1000"

    // 投稿ネタの加工
    Array.from(comments)
      .filter(c => compareNo(getCommentNo(c), shimekiriNo))
      .forEach(neta => {
        const commentNo = getCommentNo(neta)

        const userName = getComCardBlockUserName(neta).innerText.trim()
        let netaelm = getComCardBlockBodyItem(neta)
        const netaText = netaelm.innerText.trim()

        netaData.push(new Neta(commentNo, userName, netaText))
        neta.classList.add('selectable')

        neta.addEventListener('click', netaClick)

        let userInfo = getComCardBlockUserInfo(neta)
        nameElms.push(userInfo)

        netaelm.style.pointerEvents = 'none'
        userInfo.style.pointerEvents = 'none'
        getComCardBlockBody(neta).style.pointerEvents = 'none'
    })

    // 審査コメントをセーブ
    otherVotes = Array.from(comments)
      .filter(c => !compareNo(getCommentNo(c), shimekiriNo))

    let st = document.createElement('style')
    st.innerText = '.selectable:hover{ background-color:gray; cursor:pointer;}'
    document.body.appendChild(st)
}

const mypoint = () => {
    const point = Array.from(document.getElementsByName('votePoint'))
                    .filter(v => v.checked)[0]
    return point ? point.value : '1'
}

const changedHiddenName = () => {
    const hidden = hiddenName() ? 'none' : 'block'
    nameElms.forEach(n => n.style.display = hidden)
}

const changeFirstExperience = () => {
    maxVote = document.getElementById('firstExperience').checked ? 5 : 3
    setVoteCount()
}

const changedHiddenOtherVote = () => {
    const hidden = document.getElementById('hiddenOtherVote').checked
                    ? 'none': 'block'
    otherVotes.forEach(v => v.style.display = hidden)
}

const netaClick = () => {
    event.stopPropagation()
    const neta = netaData.filter(n => n.commentNo == getCommentNo(event.target))[0]
    if(!neta) return

    neta.checked = !neta.checked
    event.target.style.backgroundColor = neta.checked ? "#fff33f" : "inherit"

    voteCount = netaData.filter(n => n.checked).length
    setVoteCount()
    setPreviewText()
}

const changeNetaCheck = () => {
    const cbx = event.target
    let theboke = netaData.filter(b => b.commentNo == cbx.value)[0]
    if(!theboke) return
    theboke.checked = cbx.checked
    setPreviewText()
}

const setPreviewText = () => {
    let previewArea = document.getElementById("previewArea")
    if(!previewArea) return

    let preview = ''
    netaData.filter(neta => neta.checked).forEach(neta => {
        preview += `${neta.neta}\r\n\r\n`
    })

    previewArea.value = preview
}

const setVoteCount = () => {
    let voteCnt = document.getElementById('voteCountStatus')
    let voteMax = document.getElementById('maxVoteStatus')
    voteCnt.style.color = maxVote < voteCount ? 'red' : "inherit"
    voteCnt.style.fontWeight = maxVote < voteCount ? 'bold' : 'normal'
    voteCnt.style.fontSize = "12px"
    voteCnt.style.paddingLeft = "10px"

    voteCnt.innerText = `${voteCount}`
    voteMax.innerText = `/${maxVote}`
}

const buildVoteText = () => {
    const point = mypoint()
    const isSimple = simpleVote()
    const withNeta = withNetaVote()

    let pointExp = ''
    if(isSimple) {
        pointExp = '簡易審査'
        pointExp += point == '1' ? '\r\n' : `${point}点\r\n`
    } else {
        pointExp = point == '1' ? ''
                 : point == '2' ? '************\r\n★★（2点）\r\n************\r\n'
                 : '************\r\n★★★（3点）\r\n************\r\n'
    }

    let votes = pointExp
    let vote = ''
    if(isSimple) {
        netaData.filter(neta => neta.checked).forEach(neta => {
            vote += `${removeKakko(neta.commentNo)}\r\n`
        })
    } else {
        if(withNeta) {
            netaData.filter(neta => neta.checked).forEach(neta => {
                vote += `${neta.commentNo}:${neta.userName}さん\r\n${neta.neta}\r\n\r\n`
            })
        } else {
            netaData.filter(neta => neta.checked).forEach(neta => {
                vote += `${neta.commentNo}:${neta.userName}さん\r\n`
            })
        }
    }
    votes += vote
    return votes.trimEnd().trimEnd()
}

const setResult = () => {
    var come = document.getElementById('communityText')

    come.value = buildVoteText()
    come.scrollIntoView({behavior: "auto", block: "end", inline: "nearest"});
}

const removeKakko = s => { return s.replace("[","").replace("]","") }
const compareNo = (a, b) => parseInt(removeKakko(a)) < parseInt(removeKakko(b))
const hiddenName = () => { return document.getElementById('hiddenName').checked }
const simpleVote = () => { return document.getElementById('simpleVote').checked }
const withNetaVote = () => { return document.getElementById('voteWithNeta').checked }

const getComCardBlockBody = root => { return root.querySelector("div.COMMUNITY_cardBlockBody") }
const getComCardBlockBodyItem = root => { return root.querySelector('div.COMMUNITY_cardBlockBody__item') }
const getComCardBlockBodyReactionBox = root => {return root.querySelector('div.COMMUNITY_cardBlockBody__reactionBox')}
const getComCardBlockUserInfo = root => { return root.querySelector('div.COMMUNITY_cardBlockUserInfo') }
const getComCardBlockUserName = root => { return root.querySelector('a.COMMUNITY_cardBlockUserInfo__userName') }
const getCommentNo = neta => {
    return neta.querySelector('a.COMMUNITY_cardBlockUserInfo__userNumber').innerText.trim()
}

const divIn = (el1, el2) => {
    let d = document.createElement('div')
    d.style.textAlign = 'left'
    d.appendChild(el1)
    d.appendChild(el2)
    return d
}

const d = new Zuno()