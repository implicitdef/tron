package manu.tron.service.impl

import manu.tron.common.Vocabulary._
import manu.tron.service.GameBasicLogicService

trait GameBasicLogicServiceComponent {

  val gameBasicLogicService: GameBasicLogicService

  class GameBasicLogicServiceImpl extends GameBasicLogicService {

    val allDirections = Vector(North, West, East, South)

    val anyDirection = allDirections.head

    def validDirections(status: GameStatus, selfId: PlayerId): Seq[Direction] =
      allDirections.filter(d =>
        isPosValid(
          applyDirection(
            status.playersPos.get(selfId).get,
            d
          ),
          status
        )
      )

    def isPosValid(p: Pos, status: GameStatus) =
      isPosInBoard(p, status.board) &&
        ! status.playersPos.values.toSet.contains(p) &&
        ! status.playersPreviousPos.exists(_._2.contains(p))

    def isPosInBoard(p: Pos, board: Board) =
      (0 until board.width ).contains(p.x) &&
      (0 until board.height).contains(p.y)

    def applyDirection(p: Pos, d: Direction) =
      Pos(
        applyDirectionToXCoordinate(p.x, d),
        applyDirectionToYCoordinate(p.y, d)
      )

    def applyDirections(p: Pos, dirs: Seq[Direction]) =
      dirs match {
        case Seq() => p
        case _ => applyDirections(applyDirection(p, dirs.head), dirs.tail)
      }

    def neighbourhoodBySide(p: Pos) =
      allDirections.map(applyDirection(p, _))

    def otherPlayer(status: GameStatus, selfId: PlayerId): PlayerId =
      status.playersPos.keys.find( _ != selfId ).get

    private def applyDirectionToXCoordinate(coordinate: Int, d: Direction) =
      d match {
        case West => coordinate - 1
        case East => coordinate + 1
        case _ => coordinate
      }

    private def applyDirectionToYCoordinate(coordinate: Int, d: Direction) =
      d match {
        case North => coordinate - 1
        case South => coordinate + 1
        case _ => coordinate
      }
  }

}